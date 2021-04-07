// {
//   "name": "trading-bot",
//   "version": "0.3.0",
//   "description": "My Trading Bot",
//   "main": "index.js",
//   "scripts": {
//     "start": "node index.js",
//     "test": "node test.js"
//   },
//   "license": "MIT",
//   "dependencies": {
//     "@truffle/hdwallet-provider": "^1.2.6",
//     "axios": "^0.21.1",
//     "console.table": "^0.10.0",
//     "dotenv": "^8.2.0",
//     "ejs": "^3.1.6",
//     "express": "^4.17.1",
//     "infura-web3-provider": "^0.0.3",
//     "lodash": "^4.17.21",
//     "moment": "^2.29.1",
//     "moment-timezone": "^0.5.33",
//     "numeral": "^2.0.6",
//     "request": "^2.88.2"
//   }
// }

const web3 = require("web3")


import DaiTokenABI from "./DAItoken.json"
import LendingPoolAddressesProviderABI from "./LendingPoolAddressesProvider.json"
import LendingPoolABI from "./LendingPool.json"

// Input variables
const collateralAddress = "COLLATERAL_ADDRESS"
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const userLiquidated = "USER_BEING_LIQUIDATED"
const purchaseAmount = web3.utils.toWei("100", "ether")
const receiveATokens = true

const lpAddressProviderAddress = '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8' // mainnet address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressesProviderABI, lpAddressProviderAddress)
