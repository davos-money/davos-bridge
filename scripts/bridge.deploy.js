let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce

    // External
    let _consensus, _symbol, _name;

    if (hre.network.name == "linea") {
        chainid = 59144;
        _consensus = "0x4d5F4cAEe7f51670A4c3a9f6C93D4B42418E3d90";
        _symbol = "LIN";
        _name = "Linea";
    } else if (hre.network.name == "lineaTestnet") {
        chainid = 59140;
        _consensus = "0x14330cfC54aA5a5637Af47330d3e3701eBe50273";
        _symbol = "LIN";
        _name = "LineaTestnet";
    } else if (hre.network.name == "avalanche") { 
        chainid = 43114;
        _consensus = "0x4d5F4cAEe7f51670A4c3a9f6C93D4B42418E3d90";
        _symbol = "AVAX";
        _name = "Avalanche";
    } else if (hre.network.name == "avalancheTestnet") {
        chainid = 43113;
        _consensus = "0x14330cfC54aA5a5637Af47330d3e3701eBe50273";
        _symbol = "AVAX";
        _name = "AvalancheTestnet";
    } else throw("ERR:> Network Unsupported !");
    
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
    fs.writeFileSync(`./scripts/addresses_${network.name}.json`, json_addresses);
    console.log(`./scripts/addresses_${network.name}.json`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});