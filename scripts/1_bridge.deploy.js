let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce

    // External
    let _symbol, _name;
    let { _consensus } = require(`./bridge.config.json`);

    if (hre.network.name == "arbitrum" || hre.network.name == "arbitrumTestnet") {
        console.log("ARBITRUM deployment")
        let {_symbolArb} = require(`./bridge.config.json`); _symbol = _symbolArb;
        let {_nameArb} = require(`./bridge.config.json`); _name =_nameArb;
    } else if (hre.network.name == "optimism" || hre.network.name == "optimismTestnet") {
        console.log("OPTIMISM deployment")
        let {_symbolOpt} = require(`./bridge.config.json`); _symbol = _symbolOpt;
        let {_nameOpt} = require(`./bridge.config.json`); _name = _nameOpt;
    } else if (hre.network.name == "bsc" || hre.network.name == "bscTestnet") {
        console.log("BSC deployment")
        let {_symbolBsc} = require(`./bridge.config.json`); _symbol = _symbolBsc;
        let {_nameBsc} = require(`./bridge.config.json`); _name = _nameBsc;
    } else {
        throw "STOPPED";
    }

    console.log(_symbol);
    console.log(_name);
    console.log(_consensus);

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
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});