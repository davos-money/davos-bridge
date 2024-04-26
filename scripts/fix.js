let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();

    let bridge = "0xBD6a39B9560DE17854d42d29265BfEcA61b2758C"; 
    bridge = await ethers.getContractAt("DavosBridge", bridge)

        await bridge.addBridge("0x89f2DBE6Cb27e883E19CF62f6271ed7cC978994c", "80001"); console.log("1");
        await bridge.addBridge("0x37eF5327b05a035C5d4a7210f6a1a36cC6C3a795", "17000"); console.log("2");
        await bridge.addBridge("0x5EC9FeEfA8F1Ad1A296d7Bfc6e2f20871D50F0f6", "421614"); console.log("3");
        await bridge.addBridge("0x8524ECb654BB384B83ca0254fC91FbdAFFb7A0dd", "11155420"); console.log("4");
        await bridge.addBridge("0x439Ec9a273518f2eF1bc9e51b4dEd2790aD1b05e", "97"); console.log("5");
        await bridge.addBridge("0x9b72A31626Dd49141e7ab5caDa768579d5511Cf4", "1442"); console.log("6");
        // await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "59140"); console.log("7");
        await bridge.addBridge("0x015661B619F94dA6A21f53d15fa784B5587782Ba", "43113"); console.log("8");
        await bridge.addBridge("0xf20104d12Ee4eaaE9e54793E615c6Cf1d413683a", "5003"); console.log("9");
        await bridge.addBridge("0x9c61058af8D1dF263178b4D36B476DdD016FdAe3", "919"); console.log("10");
        await bridge.addBridge("0xd4c60fA43c95F9355316ad60Eb33D55e6c7a5aEF", "84532"); console.log("10");

        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "80001", "0xC6AD4Aa6b94e266435E05256E02A5dbfc843BB82"); console.log("11");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "17000", "0x2032a74d417dA4FC4cea25007d3866D20756dB06"); console.log("12");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "421614", "0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C"); console.log("13");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "11155420", "0xa591E2E2823F7aAcd1cBA33AEEb5b79F4311ee78"); console.log("14");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "97", "0xb1592cde087605AF4588D55630C620Fe7A1B8c73"); console.log("15");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "1442", "0xFdb603DEE9F1c76dFD4F721Cd9994520a2B697b1"); console.log("16");
        // await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "59140", "0xe6Acb8a2f3318828065FBC802c64431C8AbE322C"); console.log("17");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "43113", "0xd9f0041cD2c90D1226A1cC2867CcE9DDD8eA87fE"); console.log("18");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "5003", "0x2032a74d417dA4FC4cea25007d3866D20756dB06"); console.log("19");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "919", "0xeEE3f21a37815DFEE61b764F2A29447dB1cbdc3c"); console.log("20");
        await bridge.addWarpDestination("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "84532", "0x63CBf3BF11f71C56F5751e7AE44ab86EffB98FF4"); console.log("20");
        await bridge.changeShortCap("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "5000000000000000000000"); console.log("21");
        await bridge.changeLongCap("0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F", "10000000000000000000000"); console.log("22");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});