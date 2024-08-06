require("dotenv").config();
require('hardhat-spdx-license-identifier');
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('solidity-coverage');
require('@nomiclabs/hardhat-ethers')

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
        ethereumTestnet: {
            url: process.env.GOERLI_URL,
            chainId: 17000,
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
            chainId: 421614,
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
            chainId: 11155420,
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
            chainId: 59141,
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
            chainId: 5003,
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
        },
        xLayer: {
            url: process.env.XLAYER_URL,
            chainId: 196,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_XLA) || 'auto'
        },
        xLayerTestnet: {
            url: process.env.XLAYERTESTNET_URL,
            chainId: 195,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_XLA) || 'auto'
        },
        blast: {
            url: process.env.BLAST_URL,
            chainId: 81457,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BLA) || 'auto'
        },
        blastTestnet: {
            url: process.env.BLASTTESTNET_URL,
            chainId: 168587773,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BLA) || 'auto'
        },
        zkLink: {
            url: process.env.ZKLINK_URL,
            chainId: 810180,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ZKL) || 'auto'
        },
        zkLinkTestnet: {
            url: process.env.ZKLINKTESTNET_URL,
            chainId: 810181,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_ZKL) || 'auto'
        },
        bitLayer: {
            url: process.env.BITLAYER_URL,
            chainId: 200901,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BIT) || 'auto'
        },
        bitLayerTestnet: {
            url: process.env.BITLAYERTESTNET_URL,
            chainId: 200810,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE_BIT) || 'auto'
        }
    },

    etherscan: {
        apiKey: process.env.SCAN_API_KEY,
        customChains: [
            {
                network: "blast",
                chainId: 81457,
                urls: {
                  apiURL: "https://api.blastscan.io/api",
                  browserURL: "https://blastscan.io/"
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