require("dotenv").config();
require('hardhat-spdx-license-identifier');
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

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
              },
        },
        ethereum: {
            url: process.env.ETHEREUM_URL,
            chainId: 1,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE) || 'auto'
        },
        goerli: {
            url: process.env.GOERLI_URL,
            chainId: 5,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE) || 'auto'
        },
        polygon: {
            url: process.env.POLYGON_URL,
            chainId: 137,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE) || 'auto'
        },
        mumbai: {
            url: process.env.MUMBAI_URL,
            chainId: 80001,
            accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
            gasPrice: parseInt(process.env.GAS_PRICE) || 'auto'
        }
    },

    etherscan: {
        apiKey: process.env.SCAN_API_KEY
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