require("dotenv").config();
require('hardhat-spdx-license-identifier');
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('solidity-coverage');

module.exports = {
    solidity: {
        compilers: [
            {
                version: '0.8.16',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
        ]
    },

    networks: {
        hardhat: 
        {
            accounts: {
                accountsBalance: "100000000000000000000000000",
                mnemonic: "text oblige island web bus tennis educate choice sketch board journey fluid"
              },
        },
        ethereum: {
            url: process.env.ETHEREUM_URL,
            chainId: 1,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ETH) || 'auto'
        },
        goerli: {
            url: process.env.GOERLI_URL,
            chainId: 5,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ETH) || 'auto'
        },
        polygon: {
            url: process.env.POLYGON_URL,
            chainId: 137,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_POL) || 'auto'
        },
        mumbai: {
            url: process.env.MUMBAI_URL,
            chainId: 80001,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_POL) || 'auto'
        },
        arbitrum: {
            url: process.env.ARBITRUM_URL,
            chainId: 42161,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ARB) || 'auto'
        },
        arbitrumTestnet: {
            url: process.env.ARBITRUMGOERLI_URL,
            chainId: 421613,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ARB) || 'auto'
        },
        optimism: {
            url: process.env.OPTIMISM_URL,
            chainId: 10,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_OPT) || 'auto'
        },
        optimisticGoerli: {
            url: process.env.OPTIMISMGOERLI_URL,
            chainId: 420,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_OPT) || 'auto'
        },
        zkevm: {
            url: process.env.ZKEVM_URL,
            chainId: 1101,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ZKE) || 'auto'
        },
        zkevmTestnet: {
            url: process.env.ZKEVMTESTNET_URL,
            chainId: 1442,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ZKE) || 'auto'
        },
        bsc: {
            url: process.env.BSC_URL,
            chainId: 56,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BSC) || 'auto'
        },
        bscTestnet: {
            url: process.env.BSCTESTNET_URL,
            chainId: 97,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BSC) || 'auto'
        },
        linea: {
            url: process.env.LINEA_URL,
            chainId: 59144,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_LIN) || 'auto'
        },
        lineaTestnet: {
            url: process.env.LINEATESTNET_URL,
            chainId: 59140,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_LIN) || 'auto'
        },
        avalanche: {
            url: process.env.AVALANCHE_URL,
            chainId: 43114,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_AVA) || 'auto'
        },
        avalancheTestnet: {
            url: process.env.AVALANCHETESTNET_URL,
            chainId: 43113,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_AVA) || 'auto'
        },
        mantle: {
            url: process.env.MANTLE_URL,
            chainId: 5000,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_MNT) || 'auto'
        },
        mantleTestnet: {
            url: process.env.MANTLETESTNET_URL,
            chainId: 5001,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_MNT) || 'auto'
        },
        mode: {
            url: process.env.MODE_URL,
            chainId: 34443,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_MOD) || 'auto'
        },
        modeTestnet: {
            url: process.env.MODETESTNET_URL,
            chainId: 919,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_MOD) || 'auto'
        },
        base: {
            url: process.env.BASE_URL,
            chainId: 8453,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BAS) || 'auto'
        },
        baseTestnet: {
            url: process.env.BASETESTNET_URL,
            chainId: 84532,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BAS) || 'auto'
        }
    },

    etherscan: {
        apiKey: process.env.SCAN_API_KEY,
        customChains: [
            {
              network: "zkevmTestnet",
              chainId: 1442,
              urls: {
                apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
                browserURL: "https://testnet-zkevm.polygonscan.com/"
              }
            }
          ]
    },

    mocha: {
        grep: '^(?!.*; using Ganache).*'
    },

    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
    },

    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
        currency: 'USD',
    },
};