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
    } else throw("ERR:> Network Unsupported !");

    if (hre.network.name == "mantle") {
        // addBridge(address bridge, uint256 toChain)
        // addWarpDestination(address fromToken, uint256 toChain, address toToken)
        console.log("MANTLE NETWORK");
        await bridge.addBridge("0x78BE0423567A85Ba677d3AA5b73b45970E52256b", "137"); console.log("1");
        await bridge.addBridge("0x6DeF4570251E1f435E121b3Ee47174496D851C99", "1"); console.log("2");
        await bridge.addBridge("0xC734528d0525923F29979393f3988168ad26d402", "42161"); console.log("3");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "10"); console.log("4");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "56"); console.log("5");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "1101"); console.log("6");
        await bridge.addBridge("0x8ec1877698acf262fe8ad8a295ad94d6ea258988", "59144"); console.log("7");
        await bridge.addBridge("0x62a509ba95c75cabc7190469025e5abee4eddb2a", "43114"); console.log("8");
        await bridge.addBridge("0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4", "34443"); console.log("9");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "8453"); console.log("10");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "137", "0xEC38621e72D86775a89C7422746de1f52bbA5320"); console.log("11");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "1", "0xa48F322F8b3edff967629Af79E027628b9Dd1298"); console.log("12");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "42161", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("13");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "10", "0xb396b31599333739A97951b74652c117BE86eE1D"); console.log("14");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "56", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("15");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "1101", "0x819d1Daa794c1c46B841981b61cC978d95A17b8e"); console.log("16");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "59144", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("17");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "43114", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("18");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "34443", "0x819d1Daa794c1c46B841981b61cC978d95A17b8e"); console.log("19");
        await bridge.addWarpDestination("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "8453", "0xf2393EEAdD67bf68a60f39992113775966F34E1e"); console.log("20");
        await bridge.changeShortCap("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "50000000000000000000"); console.log("21")
        await bridge.changeLongCap("0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a", "100000000000000000000"); console.log("22")
    } else if (hre.network.name == "mode") { 
        console.log("MODE NETWORK");
        await bridge.addBridge("0x78BE0423567A85Ba677d3AA5b73b45970E52256b", "137"); console.log("1");
        await bridge.addBridge("0x6DeF4570251E1f435E121b3Ee47174496D851C99", "1"); console.log("2");
        await bridge.addBridge("0xC734528d0525923F29979393f3988168ad26d402", "42161"); console.log("3");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "10"); console.log("4");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "56"); console.log("5");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "1101"); console.log("6");
        await bridge.addBridge("0x8ec1877698acf262fe8ad8a295ad94d6ea258988", "59144"); console.log("7");
        await bridge.addBridge("0x62a509ba95c75cabc7190469025e5abee4eddb2a", "43114"); console.log("8");
        await bridge.addBridge("0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4", "5000"); console.log("9");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "8453"); console.log("10");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "137", "0xEC38621e72D86775a89C7422746de1f52bbA5320"); console.log("11");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "1", "0xa48F322F8b3edff967629Af79E027628b9Dd1298"); console.log("12");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "42161", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("13");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "10", "0xb396b31599333739A97951b74652c117BE86eE1D"); console.log("14");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "56", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("15");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "1101", "0x819d1Daa794c1c46B841981b61cC978d95A17b8e"); console.log("16");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "59144", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("17");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "43114", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("18");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "5000", "0x62A509BA95c75Cabc7190469025E5aBeE4eDdb2a"); console.log("19");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "8453", "0xf2393EEAdD67bf68a60f39992113775966F34E1e"); console.log("20");
        await bridge.changeShortCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "50000000000000000000"); console.log("21");
        await bridge.changeLongCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "100000000000000000000"); console.log("22");
    } else throw("ERR:> Network Unsupported !");



}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});