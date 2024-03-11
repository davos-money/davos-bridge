let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

const admin_slot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

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

    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");
    
    let multisig;
    let addr = require(`./addresses_${hre.network.name}.json`);
    let b = await this.DavosBridge.attach(addr._davosBridge);

    if (hre.network.name == "mantle") {
        multisig = deployer;
    } else if (hre.network.name == "mode") { 
        multisig = deployer;
    } else if (hre.network.name == "base") { 
        multisig = "0x400d5477e52c5037f6eF1BceBc063eDF68a7603D";
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