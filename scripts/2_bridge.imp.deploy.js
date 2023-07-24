let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();

    // Fetching
    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");

    // Deployment
    console.log("Bridge...");

    let davosBridge = await this.DavosBridge.deploy();
    await davosBridge.deployed();
    console.log("DavosBridge     : " + davosBridge.address);

    // Store
    const addresses = {
        _davosBridge    : davosBridge.address,
    }

    const json_addresses = JSON.stringify(addresses);
    fs.writeFileSync(`./scripts/addresses_${network.name}_2.json`, json_addresses);
    console.log(`./scripts/addresses_${network.name}_2.json`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});