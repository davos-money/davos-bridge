let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();

    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");
    
    let multisig;
    let addr = require(`./addresses_${hre.network.name}.json`);
    let b = await this.DavosBridge.attach(addr._davosBridge);

    if (hre.network.name == "linea") {
        multisig = "0x8F0E864AE6aD45d973BD5B3159D5a7079A83B774";
    } else if (hre.network.name == "avalanche") { 
        multisig = "0x6122255099D7603ec8216941aA7a4aDe497CC9c4";
    } else throw("ERR:> Network Unsupported !");

    console.log("===Transfering Ownership");
    await b.transferOwnership(multisig); console.log("Transfered");

    console.log("=== Try proxyAdmin transfer...");
    const proxyAdminAddress = parseAddress(await ethers.provider.getStorageAt(b.address, admin_slot));

    let PROXY_ADMIN_ABI = ["function owner() public view returns (address)"];
    let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);

    let owner = await proxyAdmin.owner();
    console.log("Owner: ", owner);

    if (owner != ethers.constants.AddressZero && owner != multisig) {
        PROXY_ADMIN_ABI = ["function transferOwnership(address newOwner) public"];
        let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);
        await proxyAdmin.transferOwnership(multisig);
        console.log("proxyAdmin transferred");
    } else {
        console.log("Already owner of proxyAdmin")
    }
    console.log("Transfer Complete !!!");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});