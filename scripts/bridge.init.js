let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    // Signer
    [deployer] = await ethers.getSigners();
    let addr = require(`./addresses_${hre.network.name}.json`);

    // Fetching
    this.DavosBridge = await hre.ethers.getContractFactory("DavosBridge");
    let davosbridge = await this.DavosBridge.attach(addr._davosBridge);

    // Vars
    let mumbai = await hre.ethers.getContractAt("DavosBridge", "0xeCb76C44A1C0c465f39E3c1f1bBD1e6aC82e2ee0");
    let goerli = await hre.ethers.getContractAt("DavosBridge", "0x59f1f51c3301555DdB06f69BDdd9882dc3ff505a");
    let arbitrum = await hre.ethers.getContractAt("DavosBridge", "0x4a3d26b0Bd8993FCC3EcC2AF64Ebb3feb56B957A");
    let optimism = await hre.ethers.getContractAt("DavosBridge", "0x9A00Ae4be4a9dD1327F982F4d648Bc71CFf36F1C");
    let bsc = await hre.ethers.getContractAt("DavosBridge", "0xB22744Afe661e5785d2B17fC5E51716D520E8710");
    let zkevm = await hre.ethers.getContractAt("DavosBridge", "0x8F98eb901E25711aDf94633d6BBc7e932f7Ab4CC");
    let linea = await hre.ethers.getContractAt("DavosBridge", "0x2CDbdb6BB5d9E77Aa2e85bFf728D2202904021DA");
    // let avalanche = await hre.ethers.getContractAt("DavosBridge", "0x0e4c321AE7A5dd7574ad4827b52C7414b42FE62E");

    // Deployment
    console.log("Bridge..."); 
    // await davosbridge.addBridge(mumbai.address, 80001); console.log("1");
    // await davosbridge.addBridge(goerli.address, 5); console.log("2");
    // await davosbridge.addBridge(arbitrum.address, 421613); console.log("3");
    // await davosbridge.addBridge(optimism.address, 420); console.log("4");
    // await davosbridge.addBridge(bsc.address, 97); console.log("5");
    // await davosbridge.addBridge(zkevm.address, 1442); console.log("6");
    // await davosbridge.addBridge(linea.address, 59140); console.log("7");
    // await davosbridge.addBridge(avalanche.address, 43113); console.log("8");

    // // await mumbai.addBridge(davosbridge.address, 59140); console.log("9");
    // // await goerli.addBridge(davosbridge.address, 59140); console.log("10");
    // // await arbitrum.addBridge(davosbridge.address, 59140); console.log("11");
    // // await optimism.addBridge(davosbridge.address, 59140); console.log("12");
    // // await bsc.addBridge(davosbridge.address, 59140); console.log("13");
    // // await zkevm.addBridge(davosbridge.address, 59140); console.log("14");
    // // // await linea.addBridge(davosbridge.address, 59140); console.log("15");
    // // await avalanche.addBridge(davosbridge.address, 59140); console.log("16");

    // addWarpDestination(address fromToken, uint256 toChain, address toToken)
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 80001, "0xD14F6c6a2BDC8172C460F4CaABb93a718764F0B5"); console.log("17");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 5, "0x110C7dc503Abe9E5771A2FC0cAd77b26203be3FA"); console.log("18");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 421613, "0x78f3d6830092ACAbAE65936B467359Bcf71472ff"); console.log("19");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 420, "0xed72aC9BA68caE26D7889d3b954cC7DcA31117Ca"); console.log("20");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 97, "0xB155f3E06AA210A33EAFB76087A8b58C388286B8"); console.log("21");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 1442, "0x294cf7f71CDb8FE7D3CdE779E0665D26f683F523"); console.log("22");
    await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 59140, "0xe6Acb8a2f3318828065FBC802c64431C8AbE322C"); console.log("23");
    // await davosbridge.addWarpDestination("0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE", 43113, "0x2c0bdB05Ca5a166bcB19aC43C67B4A986b6284bE"); console.log("24");

    // await mumbai.addWarpDestination("0xC6AD4Aa6b94e266435E05256E02A5dbfc843BB82", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("25");
    // await goerli.addWarpDestination("0x80f6017aEc2f60079CAc141904b6d2e1Fb2599e7", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("26");
    // await arbitrum.addWarpDestination("0xFdb603DEE9F1c76dFD4F721Cd9994520a2B697b1", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("27");
    // await optimism.addWarpDestination("0xFdb603DEE9F1c76dFD4F721Cd9994520a2B697b1", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("28");
    // await bsc.addWarpDestination("0xb1592cde087605AF4588D55630C620Fe7A1B8c73", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("29");
    // await zkevm.addWarpDestination("0xFdb603DEE9F1c76dFD4F721Cd9994520a2B697b1", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("30");
    // // await linea.addWarpDestination("0xA5d737F382B766c4174A91ad07634185bFBD6006", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("31");
    // await avalanche.addWarpDestination("0xd9f0041cD2c90D1226A1cC2867CcE9DDD8eA87fE", 59140, "0xA5d737F382B766c4174A91ad07634185bFBD6006"); console.log("32");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});