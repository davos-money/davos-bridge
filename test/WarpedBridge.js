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
            await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('100'));
            await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('100'));
            await bridge2.changeTxCap(warptoken2.address, ethers.utils.parseEther('100'));
            await bridge2.changeDayCap(warptoken2.address, ethers.utils.parseEther('100'));
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

        describe("Capacity growth with each transaction", function () {
            before(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge2.changeTxCap(warptoken2.address, ethers.utils.parseEther('100'));
                await bridge2.changeDayCap(warptoken2.address, ethers.utils.parseEther('100'));
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
            let token1WithdrawDayCap = 0n;
            args.forEach(function(arg){
                it(`depositCapDay growths with deposits: ${arg.amount}`, async () => {
                    const signer = arg.signer();
                    const tx1 = await bridge1.connect(signer).depositToken(warptoken1.address, CHAIN1, signer.address, arg.amount);
                    receipt = await tx1.wait();
                    token1DepositDayCap += arg.amount;

                    const ts = await bridge1.getCurrentDayStamp();
                    expect(await bridge1.depositCapDay(warptoken1.address, ts)).to.be.eq(token1DepositDayCap);
                    expect(await bridge1.withdrawCapDay(warptoken1.address, ts)).to.be.eq(0n);
                    expect(await bridge2.depositCapDay(warptoken2.address, ts)).to.be.eq(0n);
                    expect(await bridge2.withdrawCapDay(warptoken2.address, ts)).to.be.eq(token1WithdrawDayCap);
                });
                it(`withdrawTxCap growths with withdrawals: ${arg.amount}`, async () => {
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);
                    token1WithdrawDayCap += arg.amount;

                    const ts = await bridge1.getCurrentDayStamp();
                    expect(await bridge1.depositCapDay(warptoken1.address, ts)).to.be.eq(token1DepositDayCap);
                    expect(await bridge1.withdrawCapDay(warptoken1.address, ts)).to.be.eq(0n);
                    expect(await bridge2.depositCapDay(warptoken2.address, ts)).to.be.eq(0n);
                    expect(await bridge2.withdrawCapDay(warptoken2.address, ts)).to.be.eq(token1WithdrawDayCap);
                });
            })
        })

        describe("Capacity resets each day", function () {
            before(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge2.changeTxCap(warptoken2.address, ethers.utils.parseEther('10'));
                await bridge2.changeDayCap(warptoken2.address, ethers.utils.parseEther('10'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                { amount: ethers.utils.parseEther('10'), signer: () => eoa1 },
                { amount: ethers.utils.parseEther('10'), signer: () => eoa1 },
                { amount: ethers.utils.parseEther('10'), signer: () => eoa2 },
            ]
            args.forEach(function(arg){
                it(`depositCapDay per day: ${arg.amount}`, async () => {
                    await toNextDay();

                    const signer = arg.signer();
                    await warptoken1.connect(signer).approve(bridge1.address, arg.amount);
                    let tx1 = await bridge1.connect(signer).depositToken(warptoken1.address, CHAIN1, eoa2.address, arg.amount);
                    receipt = await tx1.wait();

                    const ts = await bridge1.getCurrentDayStamp();
                    expect(await bridge1.depositCapDay(warptoken1.address, ts)).to.be.eq(arg.amount);
                    expect(await bridge1.withdrawCapDay(warptoken1.address, ts)).to.be.eq(0n);
                    expect(await bridge2.depositCapDay(warptoken2.address, ts)).to.be.eq(0n);
                    expect(await bridge2.withdrawCapDay(warptoken2.address, ts)).to.be.eq(0n);
                });
                it(`withdrawTxCap per day: ${arg.amount}`, async () => {
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await bridge2.connect(eoa2).withdraw(encodedProof, rawReceipt, proofSignature);

                    const ts = await bridge1.getCurrentDayStamp();
                    expect(await bridge1.depositCapDay(warptoken1.address, ts)).to.be.eq(arg.amount);
                    expect(await bridge1.withdrawCapDay(warptoken1.address, ts)).to.be.eq(0n);
                    expect(await bridge2.depositCapDay(warptoken2.address, ts)).to.be.eq(0n);
                    expect(await bridge2.withdrawCapDay(warptoken2.address, ts)).to.be.eq(arg.amount);
                });
            })
        })

        describe("dayCap limit can not be exceeded on deposit", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('100'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(19), randBigInt(19)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge1.dayCap(warptoken1.address)) - depositCapDay + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(19), randBigInt(19)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge1.dayCap(warptoken1.address)) - depositCapDay + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge1.dayCap(warptoken1.address)) - depositCapDay + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let token1DayCap = 0n;
                    for(const amount of arg.successfulDeposits){
                       tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                       await tx.wait();
                       token1DayCap += amount;
                    }
                    const lastAmount = await arg.lastDeposit(token1DayCap);
                    await expect(bridge1.connect(arg.lastSigner()).depositToken(warptoken1.address, CHAIN1, eoa1.address, lastAmount))
                      .to.be.revertedWith("DavosBridge/deposit-day-cap-exceeded");
                });
            })
        })

        describe("dayCap limit can not be exceeded on withdraw", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('1000'));
                await bridge2.changeTxCap(warptoken2.address, ethers.utils.parseEther('1000'));
                await bridge2.changeDayCap(warptoken2.address, ethers.utils.parseEther('10'));
                await warptoken1.connect(deployer).mint(eoa2.address, ethers.utils.parseEther('100'));
            });

            const args = [
                {
                    name: "Exceed with multiple txs and the same signer",
                    successfulDeposits: [randBigInt(18), randBigInt(18)],
                    lastSigner: () => eoa1,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge2.dayCap(warptoken2.address)) - depositCapDay + 1n
                },
                {
                    name: "Exceed with multiple txs and different signers",
                    successfulDeposits: [randBigInt(18), randBigInt(18)],
                    lastSigner: () => eoa2,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge2.dayCap(warptoken2.address)) - depositCapDay + 1n
                },
                {
                    name: "Exceed with 1 tx",
                    successfulDeposits: [],
                    lastSigner: () => eoa1,
                    lastDeposit: async (depositCapDay) => BigInt(await bridge2.dayCap(warptoken2.address)) - depositCapDay + 1n
                },
            ]
            args.forEach(function(arg){
                it(`Reverts when: ${arg.name}`, async () => {
                    let token1DayCap = 0n;
                    for(const amount of arg.successfulDeposits){
                        tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                        receipt = await tx.wait();
                        [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                        await bridge2.connect(eoa1).withdraw(encodedProof, rawReceipt, proofSignature);
                        token1DayCap += amount;
                    }

                    const lastAmount = await arg.lastDeposit(token1DayCap);
                    const tx1 = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, arg.lastSigner().address, lastAmount);
                    receipt = await tx1.wait();
                    [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);
                    await expect(bridge2.connect(arg.lastSigner()).withdraw(encodedProof, rawReceipt, proofSignature))
                      .to.be.revertedWith("DavosBridge/withdraw-day-cap-exceeded");
                });
            })
        })

        describe("depositTxCap limit can not be exceeded", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('10'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('100'));
            })
            it("Reverts when deposit amount is greater than txCap", async function() {
                await warptoken1.connect(eoa1).approve(bridge1.address, ethers.utils.parseEther('100'));
                const amount = BigInt(ethers.utils.parseEther('10')) + 1n;
                await expect(bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa2.address, amount))
                  .to.be.revertedWith("DavosBridge/deposit-tx-cap-exceeded");
            })
            it("Reverts when sum of deposit amounts exceeds txCap", async function() {
                await warptoken1.connect(eoa1).approve(bridgeCaller.address, ethers.utils.parseEther('100'));

                await expect(bridgeCaller.connect(eoa1).bridgeTokens(
                  warptoken1.address,
                  CHAIN1,
                  [eoa2.address, eoa2.address, eoa2.address],
                  [ethers.utils.parseEther('5'), ethers.utils.parseEther('5'), '1',]))
                  .to.be.revertedWith("DavosBridge/deposit-tx-cap-exceeded");
            })
        })

        describe("withdrawTxCap limit can not be exceeded", function () {
            beforeEach(async () => {
                await init();
                await bridge1.changeTxCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge1.changeDayCap(warptoken1.address, ethers.utils.parseEther('100'));
                await bridge2.changeTxCap(warptoken2.address, ethers.utils.parseEther('10'));
                await bridge2.changeDayCap(warptoken2.address, ethers.utils.parseEther('100'));
            })
            it("Reverts when withdraw amount is greater than txCap", async function() {
                const amount = BigInt(ethers.utils.parseEther('10')) + 1n;
                tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                receipt = await tx.wait();
                [encodedProof, rawReceipt, proofSignature, proofHash] = generateWithdrawalData(consensus, receipt);

                await expect(bridge2.connect(eoa1).withdraw(encodedProof, rawReceipt, proofSignature))
                  .to.be.revertedWith("DavosBridge/withdraw-tx-cap-exceeded");
            })
            it("Reverts when sum of withdraw amounts exceeds txCap", async function() {
                const amounts = [ethers.utils.parseEther('5'), ethers.utils.parseEther('5'), '1',];
                const encodedProofs = [];
                const rawReceipts = [];
                const proofSignatures = [];
                for(const amount of amounts){
                    tx = await bridge1.connect(eoa1).depositToken(warptoken1.address, CHAIN1, eoa1.address, amount);
                    receipt = await tx.wait();
                    const [encodedProof, rawReceipt, proofSignature, _] = generateWithdrawalData(consensus, receipt);
                    encodedProofs.push(encodedProof);
                    rawReceipts.push(rawReceipt);
                    proofSignatures.push(proofSignature);
                }

                await expect(bridgeCaller.connect(eoa1).withdrawTokens(encodedProofs, rawReceipts, proofSignatures))
                  .to.be.revertedWith("DavosBridge/withdraw-tx-cap-exceeded");
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