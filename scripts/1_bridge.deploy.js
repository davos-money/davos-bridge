let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

function parseAddress(addressString){
    const buf = Buffer.from(addressString.replace(/^0x/, ''), 'hex');
    if (!buf.slice(0, 12).equals(Buffer.alloc(12, 0))) {
        return undefined;
    }
    const address = '0x' + buf.toString('hex', 12, 32); // grab the last 20 bytes
    return ethers.utils.getAddress(address);
}

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce
    const admin_slot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

    // External
    let _symbol, _name, _multisig;
    let { _consensus } = require(`./bridge.config.json`);

    if (hre.network.name == "arbitrum" || hre.network.name == "arbitrumTestnet") {
        console.log("ARBITRUM deployment")
        let {_symbolArb} = require(`./bridge.config.json`); _symbol = _symbolArb;
        let {_nameArb} = require(`./bridge.config.json`); _name =_nameArb;
        let {_multisigArb} = require(`./bridge.config.json`); _multisig =_multisigArb;
    } else if (hre.network.name == "optimism" || hre.network.name == "optimismTestnet") {
        console.log("OPTIMISM deployment")
        let {_symbolOpt} = require(`./bridge.config.json`); _symbol = _symbolOpt;
        let {_nameOpt} = require(`./bridge.config.json`); _name = _nameOpt;
        let {_multisigOpt} = require(`./bridge.config.json`); _multisig =_multisigOpt;
    } else if (hre.network.name == "bsc" || hre.network.name == "bscTestnet") {
        console.log("BSC deployment")
        let {_symbolBsc} = require(`./bridge.config.json`); _symbol = _symbolBsc;
        let {_nameBsc} = require(`./bridge.config.json`); _name = _nameBsc;
        let {_multisigBsc} = require(`./bridge.config.json`); _multisig =_multisigBsc;
    } else {
        throw "STOPPED";
    }

    console.log(_symbol);
    console.log(_name);
    console.log(_consensus);
    console.log(_multisig);

    // Fetching
    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");

    // Deployment
    console.log("Bridge...");

    let davosBridge = await upgrades.deployProxy(this.DavosBridge, [_consensus, _symbol, _name], {initializer: "initialize", nonce: _nonce}); _nonce += 1;
    await davosBridge.deployed();
    let davosBridgeImp = await upgrades.erc1967.getImplementationAddress(davosBridge.address);
    console.log("DavosBridge     : " + davosBridge.address);
    console.log("imp             : " + davosBridgeImp);

    // Store
    const addresses = {
        _davosBridge    : davosBridge.address,
        _imp            : davosBridgeImp
    }

    const json_addresses = JSON.stringify(addresses);
    fs.writeFileSync(`./scripts/addresses_${network.name}_1.json`, json_addresses);
    console.log(`./scripts/addresses_${network.name}_1.json`);

    console.log("===Transfering ownership");
    await davosBridge.transferOwnership(_multisig, { nonce: _nonce}); _nonce += 1;

    console.log("=== Try proxyAdmin transfer...");
    const proxyAdminAddress = parseAddress(await ethers.provider.getStorageAt(davosBridge.address, admin_slot));

    let PROXY_ADMIN_ABI = ["function owner() public view returns (address)"];
    let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);

    let owner = await proxyAdmin.owner();
    console.log("Owner: ", owner);
    console.log("Multi: ", _multisig);

    if (owner != ethers.constants.AddressZero && owner != _multisig) {
        PROXY_ADMIN_ABI = ["function transferOwnership(address newOwner) public"];
        let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);
        await proxyAdmin.transferOwnership(_multisig, { nonce: _nonce}); _nonce += 1;
        console.log("proxyAdmin transferred");
    } else {
        console.log("Already owner of proxyAdmin")
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});