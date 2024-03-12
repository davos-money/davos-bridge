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
        bridge = await this.DavosBridge.attach("DavosBridge", bridgeMantle);
    } else if (hre.network.name == "mode") { 
        bridge = await this.DavosBridge.attach("DavosBridge", bridgeMode);
    } else throw("ERR:> Network Unsupported !");

    if (hre.network.name == "mantle") {
        // addBridge(address bridge, uint256 toChain)
        // addWarpDestination(address fromToken, uint256 toChain, address toToken)
        await bridge.addBridge("", "137");
        await bridge.addBridge("", "1");
        await bridge.addBridge("", "42161");
        await bridge.addBridge("", "10");
        await bridge.addBridge("", "56");
        await bridge.addBridge("", "1101");
        await bridge.addBridge("", "59144");
        await bridge.addBridge("", "43114");
        await bridge.addBridge("", "34443");
        await bridge.addBridge("", "8453");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
    } else if (hre.network.name == "mode") { 
        await bridge.addBridge("", "137");
        await bridge.addBridge("", "1");
        await bridge.addBridge("", "42161");
        await bridge.addBridge("", "10");
        await bridge.addBridge("", "56");
        await bridge.addBridge("", "1101");
        await bridge.addBridge("", "59144");
        await bridge.addBridge("", "43114");
        await bridge.addBridge("", "5000");
        await bridge.addBridge("", "8453");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
        await bridge.addWarpDestination("", "", "");
    } else throw("ERR:> Network Unsupported !");

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});