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
    } else if (hre.network.name == "mantleTestnet") {
        bridge = await ethers.getContractAt("DavosBridge", "0xf7CB23aEb9781C3886c7B6fb8b3Bc06233c64096");
    } else if (hre.network.name == "modeTestnet") { 
        bridge = await ethers.getContractAt("DavosBridge", "0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA");
    } else if (hre.network.name == "baseTestnet") {
        bridge = await ethers.getContractAt("DavosBridge", "0xa591E2E2823F7aAcd1cBA33AEEb5b79F4311ee78");
    } else if (hre.network.name == "xLayerTestnet") {
        bridge = await ethers.getContractAt("DavosBridge", "0xf7CB23aEb9781C3886c7B6fb8b3Bc06233c64096");
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
        await bridge.addBridge("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "43114"); console.log("8");
        await bridge.addBridge("0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4", "34443"); console.log("9");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "8453"); console.log("10");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "137", "0xEC38621e72D86775a89C7422746de1f52bbA5320"); console.log("11");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "1", "0xa48F322F8b3edff967629Af79E027628b9Dd1298"); console.log("12");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "42161", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("13");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "10", "0xb396b31599333739A97951b74652c117BE86eE1D"); console.log("14");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "56", "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988"); console.log("15");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "1101", "0x819d1Daa794c1c46B841981b61cC978d95A17b8e"); console.log("16");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "59144", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("17");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "43114", "0xA88B54E6b76Fb97CdB8eCAE868f1458e18a953F4"); console.log("18");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "34443", "0x819d1Daa794c1c46B841981b61cC978d95A17b8e"); console.log("19");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "8453", "0xf2393EEAdD67bf68a60f39992113775966F34E1e"); console.log("20");
        await bridge.changeShortCap("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "50000000000000000000"); console.log("21")
        await bridge.changeLongCap("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "100000000000000000000"); console.log("22")
    } else if (hre.network.name == "mode") { 
        console.log("MODE NETWORK");
        await bridge.addBridge("0x78BE0423567A85Ba677d3AA5b73b45970E52256b", "137"); console.log("1");
        await bridge.addBridge("0x6DeF4570251E1f435E121b3Ee47174496D851C99", "1"); console.log("2");
        await bridge.addBridge("0xC734528d0525923F29979393f3988168ad26d402", "42161"); console.log("3");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "10"); console.log("4");
        await bridge.addBridge("0xDB34888e13FF86dE87469Ac6d4FfC8A5b293B79D", "56"); console.log("5");
        await bridge.addBridge("0x2304CE6B42D505141A286B7382d4D515950b1890", "1101"); console.log("6");
        await bridge.addBridge("0x8ec1877698acf262fe8ad8a295ad94d6ea258988", "59144"); console.log("7");
        await bridge.addBridge("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "43114"); console.log("8");
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
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "5000", "0x2032a74d417dA4FC4cea25007d3866D20756dB06"); console.log("19");
        await bridge.addWarpDestination("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "8453", "0xf2393EEAdD67bf68a60f39992113775966F34E1e"); console.log("20");
        await bridge.changeShortCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "50000000000000000000"); console.log("21");
        await bridge.changeLongCap("0x819d1Daa794c1c46B841981b61cC978d95A17b8e", "100000000000000000000"); console.log("22");
        /////////////////////////////////
    }   else if (hre.network.name == "mantleTestnet") { 
        await bridge.addBridge("0xeCb76C44A1C0c465f39E3c1f1bBD1e6aC82e2ee0", "80001"); console.log("1");
        await bridge.addBridge("0xfDcdfB8f56c7C3Ac700adFD1f8fB64B4AF6D73df", "17000"); console.log("2");
        // await bridge.addBridge("0x35eF0F82E71805D40976Ef91C791cF25225F6BCa", "42161"); console.log("3");
        await bridge.addBridge("0x9A00Ae4be4a9dD1327F982F4d648Bc71CFf36F1C", "420"); console.log("4");
        await bridge.addBridge("0xB22744Afe661e5785d2B17fC5E51716D520E8710", "97"); console.log("5");
        await bridge.addBridge("0x8F98eb901E25711aDf94633d6BBc7e932f7Ab4CC", "1442"); console.log("6");
        await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "59140"); console.log("7");
        await bridge.addBridge("0x0e4c321AE7A5dd7574ad4827b52C7414b42FE62E", "43113"); console.log("8");
        await bridge.addBridge("0xa591E2E2823F7aAcd1cBA33AEEb5b79F4311ee78", "84532"); console.log("9");
        await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "919"); console.log("10");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "80001", "0xD14F6c6a2BDC8172C460F4CaABb93a718764F0B5"); console.log("11");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "17000", "0xe895119424A301ddC773Fa53Ba3FA53D3Af840F9"); console.log("12");
        // await bridge.addWarpDestination("", "42161", ""); console.log("13");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "420", "0xed72aC9BA68caE26D7889d3b954cC7DcA31117Ca"); console.log("14");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "97", "0xB155f3E06AA210A33EAFB76087A8b58C388286B8"); console.log("15");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "1442", "0x294cf7f71CDb8FE7D3CdE779E0665D26f683F523"); console.log("16");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "59140", "0xe6Acb8a2f3318828065FBC802c64431C8AbE322C"); console.log("17");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "43113", "0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE"); console.log("18");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "84532", "0x1708dF32128fF01b8Ea0f65bC80845663E66301F"); console.log("19");
        await bridge.addWarpDestination("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "919", "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("20");
        await bridge.changeShortCap("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "50000000000000000000"); console.log("21");
        await bridge.changeLongCap("0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C", "100000000000000000000"); console.log("22");
    } else if (hre.network.name == "modeTestnet") { 
        await bridge.addBridge("0xeCb76C44A1C0c465f39E3c1f1bBD1e6aC82e2ee0", "80001"); console.log("1");
        await bridge.addBridge("0xfDcdfB8f56c7C3Ac700adFD1f8fB64B4AF6D73df", "17000"); console.log("2");
        // await bridge.addBridge("0x35eF0F82E71805D40976Ef91C791cF25225F6BCa", "42161"); console.log("3");
        await bridge.addBridge("0x9A00Ae4be4a9dD1327F982F4d648Bc71CFf36F1C", "420"); console.log("4");
        await bridge.addBridge("0xB22744Afe661e5785d2B17fC5E51716D520E8710", "97"); console.log("5");
        await bridge.addBridge("0x8F98eb901E25711aDf94633d6BBc7e932f7Ab4CC", "1442"); console.log("6");
        await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "59140"); console.log("7");
        await bridge.addBridge("0x0e4c321AE7A5dd7574ad4827b52C7414b42FE62E", "43113"); console.log("8");
        await bridge.addBridge("0xf7CB23aEb9781C3886c7B6fb8b3Bc06233c64096", "5003"); console.log("9");
        await bridge.addBridge("0xa591E2E2823F7aAcd1cBA33AEEb5b79F4311ee78", "84532"); console.log("10");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "80001", "0xD14F6c6a2BDC8172C460F4CaABb93a718764F0B5"); console.log("11");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "17000", "0xe895119424A301ddC773Fa53Ba3FA53D3Af840F9"); console.log("12");
        // await bridge.addWarpDestination("", "42161", ""); console.log("13");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "420", "0xed72aC9BA68caE26D7889d3b954cC7DcA31117Ca"); console.log("14");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "97", "0xB155f3E06AA210A33EAFB76087A8b58C388286B8"); console.log("15");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "1442", "0x294cf7f71CDb8FE7D3CdE779E0665D26f683F523"); console.log("16");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "59140", "0xe6Acb8a2f3318828065FBC802c64431C8AbE322C"); console.log("17");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "43113", "0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE"); console.log("18");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "5003", "0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C"); console.log("19");
        await bridge.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", "84532", "0x1708dF32128fF01b8Ea0f65bC80845663E66301F"); console.log("20");
        await bridge.changeShortCap("0xA5d737F382B766c4174A91ad07634185bFBD6006", "50000000000000000000"); console.log("21");
        await bridge.changeLongCap("0xA5d737F382B766c4174A91ad07634185bFBD6006", "100000000000000000000"); console.log("22");
    } else if (hre.network.name == "baseTestnet") { 
        await bridge.addBridge("0xeCb76C44A1C0c465f39E3c1f1bBD1e6aC82e2ee0", "80001"); console.log("1");
        await bridge.addBridge("0xfDcdfB8f56c7C3Ac700adFD1f8fB64B4AF6D73df", "17000"); console.log("2");
        // await bridge.addBridge("0x35eF0F82E71805D40976Ef91C791cF25225F6BCa", "42161"); console.log("3");
        await bridge.addBridge("0x9A00Ae4be4a9dD1327F982F4d648Bc71CFf36F1C", "420"); console.log("4");
        await bridge.addBridge("0xB22744Afe661e5785d2B17fC5E51716D520E8710", "97"); console.log("5");
        await bridge.addBridge("0x8F98eb901E25711aDf94633d6BBc7e932f7Ab4CC", "1442"); console.log("6");
        await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "59140"); console.log("7");
        await bridge.addBridge("0x0e4c321AE7A5dd7574ad4827b52C7414b42FE62E", "43113"); console.log("8");
        await bridge.addBridge("0xf7CB23aEb9781C3886c7B6fb8b3Bc06233c64096", "5003"); console.log("9");
        await bridge.addBridge("0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA", "919"); console.log("10");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "80001", "0xD14F6c6a2BDC8172C460F4CaABb93a718764F0B5"); console.log("11");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "17000", "0xe895119424A301ddC773Fa53Ba3FA53D3Af840F9"); console.log("12");
        // await bridge.addWarpDestination("", "42161", ""); console.log("13");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "420", "0xed72aC9BA68caE26D7889d3b954cC7DcA31117Ca"); console.log("14");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "97", "0xB155f3E06AA210A33EAFB76087A8b58C388286B8"); console.log("15");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "1442", "0x294cf7f71CDb8FE7D3CdE779E0665D26f683F523"); console.log("16");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "59140", "0xe6Acb8a2f3318828065FBC802c64431C8AbE322C"); console.log("17");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "43113", "0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE"); console.log("18");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "5003", "0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C"); console.log("19");
        await bridge.addWarpDestination("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "919", "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("20");
        await bridge.changeShortCap("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "50000000000000000000"); console.log("21");
        await bridge.changeLongCap("0x1708dF32128fF01b8Ea0f65bC80845663E66301F", "100000000000000000000"); console.log("22");
    } if (hre.network.name == "xLayerTestnet") {
        // addBridge(address bridge, uint256 toChain)
        // addWarpDestination(address fromToken, uint256 toChain, address toToken)

        console.log("XLAYER NETWORK");
        // await bridge.addBridge("0x89f2DBE6Cb27e883E19CF62f6271ed7cC978994c", "80001"); console.log("1");
        await bridge.addBridge("0x37eF5327b05a035C5d4a7210f6a1a36cC6C3a795", "17000"); console.log("2");
        await bridge.addBridge("0x5EC9FeEfA8F1Ad1A296d7Bfc6e2f20871D50F0f6", "421611"); console.log("3");
        await bridge.addBridge("0x8524ECb654BB384B83ca0254fC91FbdAFFb7A0dd", "11155420"); console.log("4");
        await bridge.addBridge("0x439Ec9a273518f2eF1bc9e51b4dEd2790aD1b05e", "97"); console.log("5");
        await bridge.addBridge("0x9b72A31626Dd49141e7ab5caDa768579d5511Cf4", "1442"); console.log("6");
        await bridge.addBridge("0xBD6a39B9560DE17854d42d29265BfEcA61b2758C", "59141"); console.log("7");
        await bridge.addBridge("0x015661B619F94dA6A21f53d15fa784B5587782Ba", "43113"); console.log("8");
        await bridge.addBridge("0xf20104d12Ee4eaaE9e54793E615c6Cf1d413683a", "5003"); console.log("9");
        await bridge.addBridge("0x9c61058af8D1dF263178b4D36B476DdD016FdAe3", "919"); console.log("10");
        await bridge.addBridge("0xd4c60fA43c95F9355316ad60Eb33D55e6c7a5aEF", "84532"); console.log("10");

        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "80001", "0xC6AD4Aa6b94e266435E05256E02A5dbfc843BB82"); console.log("11");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "17000", "0x2032a74d417dA4FC4cea25007d3866D20756dB06"); console.log("12");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "421611", "0x8dD5036334f0910eb347Ce2C62231bd9e0985c8C"); console.log("13");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "11155420", "0xa591E2E2823F7aAcd1cBA33AEEb5b79F4311ee78"); console.log("14");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "97", "0xb1592cde087605AF4588D55630C620Fe7A1B8c73"); console.log("15");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "1442", "0xFdb603DEE9F1c76dFD4F721Cd9994520a2B697b1"); console.log("16");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "59141", "0xE681456B9C7E1Fa9E3375B1D2274506a49a7092F"); console.log("17");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "43113", "0xd9f0041cD2c90D1226A1cC2867CcE9DDD8eA87fE"); console.log("18");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "5003", "0x2032a74d417dA4FC4cea25007d3866D20756dB06"); console.log("19");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "919", "0xeEE3f21a37815DFEE61b764F2A29447dB1cbdc3c"); console.log("20");
        await bridge.addWarpDestination("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "84532", "0x63CBf3BF11f71C56F5751e7AE44ab86EffB98FF4"); console.log("19");

        await bridge.changeShortCap("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "50000000000000000000"); console.log("21")
        await bridge.changeLongCap("0x2032a74d417dA4FC4cea25007d3866D20756dB06", "100000000000000000000"); console.log("22")

    } else throw("ERR:> Network Unsupported !");



}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});