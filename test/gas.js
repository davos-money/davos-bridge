const { ethers } = require('hardhat');
const TransparentUpgradeableProxy = require("@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json");
const ProxyAdmin = require("@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json");
// const ether = require('@openzeppelin/test-helpers/src/ether');

let wad = "000000000000000000", // 18 Decimals
    ray = "000000000000000000000000000", // 27 Decimals
    rad = "000000000000000000000000000000000000000000000"; // 45 Decimals

describe('===Gas Calculation===', function () {
    let deployer;

    beforeEach(async function () {
        [deployer, _multisig] = await ethers.getSigners();
    });

    describe('--- calculate()', function () {
        it('calculates: gasCost', async function () {

            var total = Number(0);

            this.Bridge = await ethers.getContractFactory("DavosBridge");
            this.PA = await ethers.getContractFactory(ProxyAdmin.abi, ProxyAdmin.bytecode);
            this.TUP = await ethers.getContractFactory(TransparentUpgradeableProxy.abi, TransparentUpgradeableProxy.bytecode);
            
            // Core
            let bridgeImp = await this.Bridge.deploy();

            total += Number(bridgeImp.deployTransaction.gasLimit);

            console.log("Bridge------------------------------" + bridgeImp.deployTransaction.gasLimit)
            console.log("TOTAL-------------------------------" + total);

            // Proxy Admin
            let proxyAdmin = await this.PA.deploy();
            console.log("ProxyAdmin--------------------------" + proxyAdmin.deployTransaction.gasLimit)
            total += Number(proxyAdmin.deployTransaction.gasLimit);
            console.log("TOTAL-------------------------------" + total);

            // Logic, Admin, Data
            let bridge = await this.TUP.deploy(bridgeImp.address, proxyAdmin.address, "0x");

            total += Number(bridge.deployTransaction.gasLimit);
            console.log("Proxy-------------------------------" + Number(bridge.deployTransaction.gasLimit))
            console.log("TOTAL-------------------------------" + total)
        });
    });
});