let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce

    // External
    let {_symbolPolygon, _namePolygon} = require(`./bridge.config.json`);
    
    // Fetching
    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");

    // Deployment
    console.log("Bridge...");

    let davosBridge = await upgrades.deployProxy(this.DavosBridge, [deployer.address, _symbolPolygon, _namePolygon], {initializer: "initialize", nonce: _nonce}); _nonce += 1;
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