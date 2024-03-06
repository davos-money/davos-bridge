// Import constants
const { ethers, upgrades, network } = require("hardhat");
const { assert, expect } = require("chai");
const web3x = require("web3");
const {
    encodeTransactionReceipt,
    encodeProof,
    randBigInt
} = require("../utils/bridge_utils");
const { signMessageUsingPrivateKey } = require("../utils/evmutils");
const config = require("../hardhat.config");

// Constants
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const CHAIN1 = "31337";
const CHAIN2 = "31338";
const CHAIN1_TOKEN_NAME = "Ethereum";
const CHAIN1_TOKEN_SYMBOL = "ETH";
const CHAIN2_TOKEN_NAME = "Polygon";
const CHAIN2_TOKEN_SYMBOL = "MATIC";
const amount = ethers.utils.parseEther('10');

// Addresses
let deployer, eoa1, eoa2, consensus, treasury;

// Protocol Contracts
let router, bridge1, bridge2, tokenFactory, bridgeCaller;

// Participant Contracts
let warptoken1, warptoken2;

// Offchain data
let encodedProof, rawReceipt, proofSignature, proofHash, receiptHash, receipt;

var tx;

async function init() {
    // Get Addresses
    [deployer, eoa1, eoa2, consensus, treasury] = await ethers.getSigners();

    // Contract Factory
    const WarpToken = await ethers.getContractFactory("WarpToken");
    const DavosBridge = await ethers.getContractFactory("DavosBridge");

    // Contract Deployment
    warptoken1 = await WarpToken.connect(deployer).deploy(); await warptoken1.deployed();
    warptoken2 = await WarpToken.connect(deployer).deploy(); await warptoken2.deployed();
    bridge1 = await upgrades.deployProxy(DavosBridge, [consensus.address, CHAIN1_TOKEN_SYMBOL, CHAIN1_TOKEN_NAME], {initializer: "initialize"}); await bridge1.deployed();
    bridge2 = await upgrades.deployProxy(DavosBridge, [consensus.address, CHAIN2_TOKEN_SYMBOL, CHAIN2_TOKEN_NAME], {initializer: "initialize"}); await bridge2.deployed();
    bridgeCaller = await ethers.deployContract("BridgeCaller", [bridge1.address, bridge2.address]); await bridgeCaller.deployed();


    // Contract Initialization
    await warptoken1.connect(deployer).initialize();
    await warptoken2.connect(deployer).initialize();

    await warptoken1.connect(deployer).mint(eoa1.address, ethers.utils.parseEther('100'));

    // Bridges must know about each other before warp
    await bridge1.addBridge(bridge2.address, CHAIN1);
    await bridge2.addBridge(bridge1.address, CHAIN1);

    // Add warp link between two warp tokens on different chains [Using same chain for test]
    await bridge1.addWarpDestination(warptoken1.address, CHAIN1, warptoken2.address);
    await bridge2.addWarpDestination(warptoken2.address, CHAIN1, warptoken1.address);

    // A bridge must have a right to mint for warp token
    await warptoken1.rely(bridge1.address);
    await warptoken2.rely(bridge2.address);

    await warptoken1.connect(eoa1).approve(bridge1.address, ethers.utils.parseEther('1000'));
    await warptoken1.connect(eoa2).approve(bridge1.address, ethers.utils.parseEther('1000'));
}

describe("===Bridge===", function () {
    this.timeout(15000);

    describe("Bridge WarpToken to WarpToken", async () => {
        before(async () => {
            await init();
            await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('100'));
            await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('100'));
            await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('100'));
            await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('100'));
        });
        it("Deposit WarpToken1", async () => {
            // Bridge can only warp tokens with allowance from 'eoa1'
            await warptoken1.connect(eoa1).approve(bridge1.address, ethers.utils.parseEther('10'));

            // Deposit WarpToken1
            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('100').toString());
            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('100').toString());

            let tx1 = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa2.address, amount);
            receipt = await tx1.wait();

            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('90').toString());
            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('90').toString());

            assert.equal(receipt.events[1].event, "DepositWarped");
            assert.equal(receipt.events[1].args["fromAddress"].toString(), eoa1.address, "Wrong toChain");
            assert.equal(receipt.events[1].args["toAddress"].toString(), eoa2.address, "Wrong toAddress");
            assert.equal(receipt.events[1].args["fromToken"].toString(), warptoken1.address, "Wrong fromToken");
            assert.equal(receipt.events[1].args["toToken"].toString(), warptoken2.address, "Wrong toToken");
            assert.equal(receipt.events[1].args["totalAmount"].toString(), amount, "Wrong totalAmount");
            // assert.equal(receipt.events[1].args["nonce"].toString(), 1, "Wrong _contractNonce");
            assert.equal(receipt.events[1].args["metadata"].symbol.toString(), ethers.utils.formatBytes32String("WTKN"), "Wrong symbol");
            assert.equal(receipt.events[1].args["metadata"].name.toString(), ethers.utils.formatBytes32String("WarpToken"), "Wrong name");
            assert.equal(receipt.events[1].args["metadata"].originChain, 0, "Wrong originChain");
            assert.equal(receipt.events[1].args["metadata"].originAddress, NULL_ADDRESS, "Wrong originToken");
        });
        it("Withdraw WarpToken2", async function () {
            // Process proofs
            [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);

            // Withdraw WarpToken2
            expect((await warptoken2.balanceOf(eoa2.address)).toString()).to.be.equal(ethers.utils.parseEther('0').toString());
            expect((await warptoken2.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('0').toString());

            let tx2 = await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);

            // let tx2 = await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature, proofHash);
            receipt = await tx2.wait();

            expect((await warptoken2.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('10').toString());
            expect((await warptoken2.balanceOf(eoa2.address)).toString()).to.be.equal(ethers.utils.parseEther('10').toString());

            assert.equal(receipt.events[1].event, "WithdrawMinted");
            assert.equal(receipt.events[1].args["receiptHash"].toString(), receiptHash, "Wrong receiptHash");
            assert.equal(receipt.events[1].args["fromAddress"].toString(), eoa1.address, "Wrong fromAddress");
            assert.equal(receipt.events[1].args["toAddress"].toString(), eoa2.address, "Wrong toAddress");
            assert.equal(receipt.events[1].args["fromToken"].toString(), warptoken1.address, "Wrong fromToken");
            assert.equal(receipt.events[1].args["toToken"].toString(), warptoken2.address, "Wrong toToken");
            assert.equal(receipt.events[1].args["totalAmount"].toString(), amount, "Wrong totalAmount");
        });
        it("Deposit WarpToken2", async () => {
            // Bridge can only warp tokens with allowance from 'eoa1'
            await warptoken2.connect(eoa2).approve(bridge2.address, ethers.utils.parseEther('10'));

            // Deposit WarpToken1
            expect((await warptoken2.balanceOf(eoa2.address)).toString()).to.be.equal(ethers.utils.parseEther('10').toString());
            expect((await warptoken2.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('10').toString());
            
            let tx1 = await bridge2.connect(eoa2).depositToken(warptoken2.address, CHAIN1, eoa1.address, amount);
            receipt = await tx1.wait();

            expect((await warptoken2.balanceOf(eoa2.address)).toString()).to.be.equal(ethers.utils.parseEther('0').toString());
            expect((await warptoken2.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('0').toString());

            assert.equal(receipt.events[1].event, "DepositWarped");
            assert.equal(receipt.events[1].args["fromAddress"].toString(), eoa2.address, "Wrong toChain");
            assert.equal(receipt.events[1].args["toAddress"].toString(), eoa1.address, "Wrong toAddress");
            assert.equal(receipt.events[1].args["fromToken"].toString(), warptoken2.address, "Wrong fromToken");
            assert.equal(receipt.events[1].args["toToken"].toString(), warptoken1.address, "Wrong toToken");
            assert.equal(receipt.events[1].args["totalAmount"].toString(), amount, "Wrong totalAmount");
            // assert.equal(receipt.events[1].args["nonce"].toString(), 1, "Wrong _contractNonce");
            assert.equal(receipt.events[1].args["metadata"].symbol.toString(), ethers.utils.formatBytes32String("WTKN"), "Wrong symbol");
            assert.equal(receipt.events[1].args["metadata"].name.toString(), ethers.utils.formatBytes32String("WarpToken"), "Wrong name");
            assert.equal(receipt.events[1].args["metadata"].originChain, 0, "Wrong originChain");
            assert.equal(receipt.events[1].args["metadata"].originAddress, NULL_ADDRESS, "Wrong originToken");
        });
        it("Withdraw WarpToken1", async function () {
            // Process proofs
            [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);

            // Withdraw WarpToken2
            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('90').toString());
            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('90').toString());

            let tx2 = await bridge1.connect(eoa1).withdraw(encodedProof, rawReceipt, proofSignature);
            receipt = await tx2.wait();

            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('100').toString());
            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('100').toString());

            assert.equal(receipt.events[1].event, "WithdrawMinted");
            assert.equal(receipt.events[1].args["receiptHash"].toString(), receiptHash, "Wrong receiptHash");
            assert.equal(receipt.events[1].args["fromAddress"].toString(), eoa2.address, "Wrong fromAddress");
            assert.equal(receipt.events[1].args["toAddress"].toString(), eoa1.address, "Wrong toAddress");
            assert.equal(receipt.events[1].args["fromToken"].toString(), warptoken2.address, "Wrong fromToken");
            assert.equal(receipt.events[1].args["toToken"].toString(), warptoken1.address, "Wrong toToken");
            assert.equal(receipt.events[1].args["totalAmount"].toString(), amount, "Wrong totalAmount");
        });
        it("reverts: Non-consensus signing", async () => {
            // --- Deposit ---
            // Bridge can only warp tokens with allowance from 'eoa1'
            await warptoken1.connect(eoa1).approve(bridge1.address, ethers.utils.parseEther('10'));

            // Deposit WarpToken1
            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('100').toString());
            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('100').toString());

            let tx1 = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa2.address, amount);
            receipt = await tx1.wait();

            expect((await warptoken1.balanceOf(eoa1.address)).toString()).to.be.equal(ethers.utils.parseEther('90').toString());
            expect((await warptoken1.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('90').toString());

            assert.equal(receipt.events[1].event, "DepositWarped");
            assert.equal(receipt.events[1].args["fromAddress"].toString(), eoa1.address, "Wrong toChain");
            assert.equal(receipt.events[1].args["toAddress"].toString(), eoa2.address, "Wrong toAddress");
            assert.equal(receipt.events[1].args["fromToken"].toString(), warptoken1.address, "Wrong fromToken");
            assert.equal(receipt.events[1].args["toToken"].toString(), warptoken2.address, "Wrong toToken");
            assert.equal(receipt.events[1].args["totalAmount"].toString(), amount, "Wrong totalAmount");
            // assert.equal(receipt.events[1].args["nonce"].toString(), 1, "Wrong _contractNonce");
            assert.equal(receipt.events[1].args["metadata"].symbol.toString(), ethers.utils.formatBytes32String("WTKN"), "Wrong symbol");
            assert.equal(receipt.events[1].args["metadata"].name.toString(), ethers.utils.formatBytes32String("WarpToken"), "Wrong name");
            assert.equal(receipt.events[1].args["metadata"].originChain, 0, "Wrong originChain");
            assert.equal(receipt.events[1].args["metadata"].originAddress, NULL_ADDRESS, "Wrong originToken");

            // --- Withdraw ---
            // Process proofs but signer is non-consensus
            [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(treasury, receipt);

            // Withdraw WarpToken2
            expect((await warptoken2.balanceOf(eoa2.address)).toString()).to.be.equal(ethers.utils.parseEther('0').toString());
            expect((await warptoken2.totalSupply()).toString()).to.be.equal(ethers.utils.parseEther('0').toString());

            await expect(bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature)).to.be.revertedWith("DavosBridge/bad-signature");
        });
    });

    describe("Capacity", function () {

        const shortCapDuration = 3600;
        const longCapDuration = 86400;

        describe("Capacity growth with each transaction", function () {
            before(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('100'));
                await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('100'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                { amount: randBigInt(19), signer: () => eoa1 },
                { amount: randBigInt(19), signer: () => eoa1 },
                { amount: randBigInt(19), signer: () => eoa2 },
                { amount: randBigInt(19), signer: () => eoa2 },
                { amount: 1n, signer: () => eoa1 },
                { amount: 0n, signer: () => eoa1 },
            ]
            let token1DepositDayCap = 0n;
            let token2WithdrawDayCap = 0n;
            args.forEach(function(arg){
                it(`CapsDeposit growth with deposits: ${arg.amount}`, async () => {
                    const signer = arg.signer();
                    const tx1 = await bridge1.connect(signer).depositToken(warptoken1.address, CHAIN1, signer.address, arg.amount);
                    receipt = await tx1.wait();
                    token1DepositDayCap += arg.amount;

                    const short = await bridge1.getCurrentStamp(shortCapDuration);
                    const long = await bridge1.getCurrentStamp(longCapDuration);
                    expect(await bridge1.shortCapsDeposit(warptoken1.address, short)).to.be.eq(token1DepositDayCap);
                    expect(await bridge1.longCapsDeposit(warptoken1.address, long)).to.be.eq(token1DepositDayCap);
                    expect(await bridge1.shortCapsWithdraw(warptoken1.address, short)).to.be.eq(0n);
                    expect(await bridge1.longCapsWithdraw(warptoken1.address, long)).to.be.eq(0n);
                });
                it(`CapsWithdraw growths with withdrawals: ${arg.amount}`, async () => {
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);
                    token2WithdrawDayCap += arg.amount;

                    const short = await bridge2.getCurrentStamp(shortCapDuration);
                    const long = await bridge2.getCurrentStamp(longCapDuration);
                    expect(await bridge2.shortCapsDeposit(warptoken2.address, short)).to.be.eq(0n);
                    expect(await bridge2.longCapsDeposit(warptoken2.address, long)).to.be.eq(0n);
                    expect(await bridge2.shortCapsWithdraw(warptoken2.address, short)).to.be.eq(token2WithdrawDayCap);
                    expect(await bridge2.longCapsWithdraw(warptoken2.address, long)).to.be.eq(token2WithdrawDayCap);
                });
            })
        })

        describe("shortCaps reset each hour", function () {
            let token1DepositDayCap = 0n;
            let token2WithdrawDayCap = 0n;

            before(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('10'));
                await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('100'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa1 },
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa1 },
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa2 },
            ]
            args.forEach(function(arg){
                it(`depositCapDay per hour: ${arg.amount}`, async () => {
                    await toNextHour();

                    const signer = arg.signer();
                    await warptoken1.connect(signer).approve(bridge1.address, arg.amount);
                    let tx1 = await bridge1.connect(signer).depositToken(warptoken1.address, CHAIN1, eoa2.address, arg.amount);
                    receipt = await tx1.wait();
                    token1DepositDayCap += arg.amount;

                    const short = await bridge1.getCurrentStamp(shortCapDuration);
                    const long = await bridge1.getCurrentStamp(longCapDuration);
                    expect(await bridge1.shortCapsDeposit(warptoken1.address, short)).to.be.eq(arg.amount);
                    expect(await bridge1.longCapsDeposit(warptoken1.address, long)).to.be.eq(token1DepositDayCap);
                    expect(await bridge1.shortCapsWithdraw(warptoken1.address, short)).to.be.eq(0n);
                    expect(await bridge1.longCapsWithdraw(warptoken1.address, long)).to.be.eq(0n);
                });
                it(`withdrawTxCap per hour: ${arg.amount}`, async () => {
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);
                    token2WithdrawDayCap += arg.amount;

                    const short = await bridge2.getCurrentStamp(shortCapDuration);
                    const long = await bridge2.getCurrentStamp(longCapDuration);
                    expect(await bridge2.shortCapsDeposit(warptoken2.address, short)).to.be.eq(0n);
                    expect(await bridge2.longCapsDeposit(warptoken2.address, long)).to.be.eq(0n);
                    expect(await bridge2.shortCapsWithdraw(warptoken2.address, short)).to.be.eq(arg.amount);
                    expect(await bridge2.longCapsWithdraw(warptoken2.address, long)).to.be.eq(token2WithdrawDayCap);
                });
            })
        })

        describe("shortCap limit can not be exceeded on deposit", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('100'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge1.shortCaps(warptoken1.address)) - amount + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (amount) => BigInt(await bridge1.shortCaps(warptoken1.address)) - amount + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge1.shortCaps(warptoken1.address)) - amount + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let tokenShortCap = 0n;
                    for(const amount of arg.successfulDeposits){
                        tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                        await tx.wait();
                        tokenShortCap += amount;
                    }
                    const lastAmount = await arg.lastDeposit(tokenShortCap);
                    await expect(bridge1.connect(arg.lastSigner()).depositToken(warptoken1.address, CHAIN1, eoa1.address, lastAmount))
                      .to.be.revertedWith("DavosBridge/short-caps-exceeded");
                });
            })
        })

        describe("shortCap limit can not be exceeded on withdraw", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('10'));
                await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('1000'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge2.shortCaps(warptoken2.address)) - amount + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (amount) => BigInt(await bridge2.shortCaps(warptoken2.address)) - amount + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge2.shortCaps(warptoken2.address)) - amount + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let tokenShortCap = 0n;
                    for(const amount of arg.successfulDeposits){
                        tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                        receipt = await tx.wait();
                        [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                        await bridge2.connect(eoa1).withdraw(encodedProof, rawReceipt, proofSignature);
                        tokenShortCap += amount;
                    }

                    const lastAmount = await arg.lastDeposit(tokenShortCap);
                    const tx1 = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, arg.lastSigner().address, lastAmount);
                    receipt = await tx1.wait();
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await expect(bridge2.connect(arg.lastSigner()).withdraw(encodedProof, rawReceipt, proofSignature))
                      .to.be.revertedWith("DavosBridge/short-caps-exceeded");
                });
            })
        })

        describe("longCaps reset each day", function () {
            before(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('10'));
                await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('10'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa1 },
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa1 },
                { amount: BigInt(ethers.utils.parseEther('10')), signer: () => eoa2 },
            ]
            args.forEach(function(arg){
                it(`depositCapDay per day: ${arg.amount}`, async () => {
                    await toNextDay();

                    const signer = arg.signer();
                    await warptoken1.connect(signer).approve(bridge1.address, arg.amount);
                    let tx1 = await bridge1.connect(signer).depositToken(warptoken1.address, CHAIN1, eoa2.address, arg.amount);
                    receipt = await tx1.wait();

                    const short = await bridge1.getCurrentStamp(shortCapDuration);
                    const long = await bridge1.getCurrentStamp(longCapDuration);
                    expect(await bridge1.shortCapsDeposit(warptoken1.address, short)).to.be.eq(arg.amount);
                    expect(await bridge1.longCapsDeposit(warptoken1.address, long)).to.be.eq(arg.amount);
                    expect(await bridge1.shortCapsWithdraw(warptoken1.address, short)).to.be.eq(0n);
                    expect(await bridge1.longCapsWithdraw(warptoken1.address, long)).to.be.eq(0n);
                });
                it(`withdrawTxCap per day: ${arg.amount}`, async () => {
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);

                    const short = await bridge2.getCurrentStamp(shortCapDuration);
                    const long = await bridge2.getCurrentStamp(longCapDuration);
                    expect(await bridge2.shortCapsDeposit(warptoken2.address, short)).to.be.eq(0n);
                    expect(await bridge2.longCapsDeposit(warptoken2.address, long)).to.be.eq(0n);
                    expect(await bridge2.shortCapsWithdraw(warptoken2.address, short)).to.be.eq(arg.amount);
                    expect(await bridge2.longCapsWithdraw(warptoken2.address, long)).to.be.eq(arg.amount);
                });
            })
        })

        describe("longCap limit can not be exceeded on deposit", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('10'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge1.longCaps(warptoken1.address)) - amount + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(17), randBigInt(17)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (amount) => BigInt(await bridge1.longCaps(warptoken1.address)) - amount + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge1.longCaps(warptoken1.address)) - amount + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let tokenLongCap = 0n;
                    for(const amount of arg.successfulDeposits){
                       tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                       await tx.wait();
                       tokenLongCap += amount;
                    }
                    const lastAmount = await arg.lastDeposit(tokenLongCap);
                    await expect(bridge1.connect(arg.lastSigner()).depositToken(warptoken1.address, CHAIN1, eoa1.address, lastAmount))
                      .to.be.revertedWith("DavosBridge/long-caps-exceeded");
                });
            })
        })

        describe("longCap limit can not be exceeded on withdraw", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeShortCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge1.changeLongCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge2.changeShortCap(warptoken2.address, ethers.utils.parseEther('1000'));
                await bridge2.changeLongCap(warptoken2.address, ethers.utils.parseEther('10'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(18), randBigInt(18)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge2.longCaps(warptoken2.address)) - amount + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(18), randBigInt(18)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (amount) => BigInt(await bridge2.longCaps(warptoken2.address)) - amount + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (amount) => BigInt(await bridge2.longCaps(warptoken2.address)) - amount + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let tokenLongCap = 0n;
                    for(const amount of arg.successfulDeposits){
                        tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                        receipt = await tx.wait();
                        [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                        await bridge2.connect(eoa1).withdraw(encodedProof, rawReceipt, proofSignature);
                        tokenLongCap += amount;
                    }

                    const lastAmount = await arg.lastDeposit(tokenLongCap);
                    const tx1 = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, arg.lastSigner().address, lastAmount);
                    receipt = await tx1.wait();
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await expect(bridge2.connect(arg.lastSigner()).withdraw(encodedProof, rawReceipt, proofSignature))
                      .to.be.revertedWith("DavosBridge/long-caps-exceeded");
                });
            })
        })

        describe("Caps setters", function() {
            beforeEach(async () => {
                await init();
            });

            it("changeShortCap: sets new value for short cap", async function() {
                const xAmount = await bridge1.shortCaps(warptoken1.address);
                const amount = randBigInt(19);
                await expect(bridge1.changeShortCap(warptoken1.address, amount))
                  .to.emit(bridge1, "ShortCapChanged")
                  .withArgs(warptoken1.address, xAmount, amount);
                expect(await bridge1.shortCaps(warptoken1.address)).to.be.eq(amount);
            })

            it("changeShortCap: reverts when called by not an owner", async function() {
                const amount = randBigInt(19);
                await expect(bridge1.connect(eoa1).changeShortCap(warptoken1.address, amount))
                  .to.revertedWith("Ownable: caller is not the owner");
            })

            it("changeShortCapDuration: sets new duration for short cap", async function() {
                const oldDur = await bridge1.shortCapDuration();
                const newDur = randBigInt(5);
                await expect(bridge1.changeShortCapDuration(newDur))
                  .to.emit(bridge1, "ShortCapDurationChanged")
                  .withArgs(oldDur, newDur);
                expect(await bridge1.shortCapDuration()).to.be.eq(newDur);
            })

            it("changeShortCapDuration: reverts when called by not an owner", async function() {
                const newDur = randBigInt(5);
                await expect(bridge1.connect(eoa1).changeShortCapDuration(newDur))
                  .to.revertedWith("Ownable: caller is not the owner");
            })

            it("changeLongCap: sets new value for long cap", async function() {
                const xAmount = await bridge1.longCaps(warptoken1.address);
                const amount = randBigInt(19);
                await expect(bridge1.changeLongCap(warptoken1.address, amount))
                  .to.emit(bridge1, "LongCapChanged")
                  .withArgs(warptoken1.address, xAmount, amount);
                expect(await bridge1.longCaps(warptoken1.address)).to.be.eq(amount);
            })

            it("changeLongCap: reverts when called by not an owner", async function() {
                const amount = randBigInt(19);
                await expect(bridge1.connect(eoa1).changeLongCap(warptoken1.address, amount))
                  .to.revertedWith("Ownable: caller is not the owner");
            })

            it("changeLongCapDuration: sets new duration for short cap", async function() {
                const oldDur = await bridge1.longCapDuration();
                const newDur = randBigInt(5);
                await expect(bridge1.changeLongCapDuration(newDur))
                  .to.emit(bridge1, "LongCapDurationChanged")
                  .withArgs(oldDur, newDur);
                expect(await bridge1.longCapDuration()).to.be.eq(newDur);
            })

            it("changeLongCapDuration: reverts when called by not an owner", async function() {
                const newDur = randBigInt(5);
                await expect(bridge1.connect(eoa1).changeLongCapDuration(newDur))
                  .to.revertedWith("Ownable: caller is not the owner");
            })
        })
    })
});

function generateWithdrawalData(signer, receipt) {
    [rawReceipt, receiptHash] = encodeTransactionReceipt(receipt);

    [encodedProof, proofHash] = encodeProof(
    CHAIN1,
    1,
    receipt.transactionHash,
    receipt.blockNumber,
    receipt.blockHash,
    receipt.transactionIndex,
    receiptHash,
    web3x.utils.padLeft(web3x.utils.toHex(amount), 64)
    );

    const accounts = config.networks.hardhat.accounts;
    for (i = 0; ; i++) {
        const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, `m/44'/60'/0'/0/${i}`);
        if (wallet1.address === signer.address) {
            const privateKey = wallet1.privateKey.substring(2);
            proofSignature = signMessageUsingPrivateKey(privateKey, proofHash);
            break;
        }
    }

    return [encodedProof, rawReceipt, proofSignature, proofHash];
}

async function increaseTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
}

async function toNextDay() {
    const block = await ethers.provider.getBlock("latest");
    const nextDayTs = Math.floor((block.timestamp)/86400 + 1)*86400;
    await increaseTime(nextDayTs - block.timestamp);
}

async function toNextHour() {
    const block = await ethers.provider.getBlock("latest");
    const nextDayTs = Math.floor((block.timestamp)/3600 + 1)*3600;
    await increaseTime(nextDayTs - block.timestamp);
}