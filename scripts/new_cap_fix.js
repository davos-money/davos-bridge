let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let bridgeMantle = "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4";
    let bridgeMode = "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4";

    let bridge; 
    
    if (hre.network.name == "mantle") {
        bridge = await ethers.getContractAt("DavosBridge", bridgeMantle);
    } else if (hre.network.name == "mode") { 
        bridge = await ethers.getContractAt("DavosBridge", bridgeMode);
    }else throw("ERR:> Network Unsupported !");

    if (hre.network.name == "mantle") {
        // addBridge(address bridge, uint256 toChain)
        // addWarpDestination(address fromToken, uint256 toChain, address toToken)
        console.log("MANTLE NETWORK");
        await bridge.changeShortCap("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "50000000000000000000000"); console.log("1")
        await bridge.changeLongCap("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "100000000000000000000000"); console.log("2")
    } else if (hre.network.name == "mode") { 
        console.log("MODE NETWORK");
        await bridge.changeShortCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "50000000000000000000000"); console.log("1");
        await bridge.changeLongCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "100000000000000000000000"); console.log("2");
    } else throw("ERR:> Network Unsupported !");



}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});