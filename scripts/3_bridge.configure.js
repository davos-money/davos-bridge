let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce

    // Deployment
    console.log("Bridge...");

    let davosBridge = await ethers.getContractAt("DavosBridge", "0x2304CE6B42D505141A286B7382d4D515950b1890");

    // await davosBridge.addBridge(bridge, toChain);
    await davosBridge.addBridge("0x78BE0423567A85Ba677d3AA5b73b45970E52256b", "137");
    await davosBridge.addBridge("0x6DeF4570251E1f435E121b3Ee47174496D851C99", "1");
    await davosBridge.addBridge("0xC734528d0525923F29979393f3988168ad26d402", "42161");
    await davosBridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "10");
    await davosBridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "56");

    // addWarpDestination(address fromToken, uint256 toChain, address toToken)
    await addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "137", "0xEC38621e72D86775a89C7422746de1f52bbA5320");
    await addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "1", "0xa48F322F8b3edff967629Af79E027628b9Dd1298");
    await addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "42161", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988");
    await addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "10", "0xb396b31599333739A97951b74652c117BE86eE1D");
    await addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "56", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});