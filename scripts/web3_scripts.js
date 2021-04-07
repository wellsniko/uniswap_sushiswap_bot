require('dotenv').config()
const Web3 = require('web3')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')
const UNISWAP = require('./exchanges/uniswap')
const KYBER = require('./exchanges/kyber')

const web3 = new Web3(process.env.RPC_URL)

const uniswapFactoryContract = new web3.eth.Contract(UNISWAP.ROPSTEN_EXCHANGE_ABI, UNISWAP.ROPSTEN_EXCHANGE_ADDRESS)
