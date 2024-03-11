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

    if (hre.network.name == "mantle") {
        chainid = 5000;
        _consensus = "0x4d5F4cAEe7f51670A4c3a9f6C93D4B42418E3d90";
        _symbol = "MNT";
        _name = "Mantle";
    } else if (hre.network.name == "mantleTestnet") {
        chainid = 5001;
        _consensus = "0x14330cfC54aA5a5637Af47330d3e3701eBe50273";
        _symbol = "MNT";
        _name = "Mantle";
    } else if (hre.network.name == "mode") { 
        chainid = 34443;
        _consensus = "0x4d5F4cAEe7f51670A4c3a9f6C93D4B42418E3d90";
        _symbol = "ETH";
        _name = "Ethereum";
    } else if (hre.network.name == "modeTestnet") {
        chainid = 919;
        _consensus = "0x14330cfC54aA5a5637Af47330d3e3701eBe50273";
        _symbol = "ETH";
        _name = "Ethereum";
    } else if (hre.network.name == "base") { 
        chainid = 8453;
        _consensus = "0x4d5F4cAEe7f51670A4c3a9f6C93D4B42418E3d90";
        _symbol = "ETH";
        _name = "Ethereum";
    } else if (hre.network.name == "baseTestnet") {
        chainid = 84532;
        _consensus = "0x14330cfC54aA5a5637Af47330d3e3701eBe50273";
        _symbol = "ETH";
        _name = "Ethereum";
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