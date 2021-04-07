require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const privateKey = process.env.PRIVATE_KEY;
const flashLoanerAddress = process.env.ACCOUNT;
const { ethers } = require('ethers');
const provider = new ethers.providers.InfuraProvider('mainnet', process.env.INFURA_KEY);
const wallet = new ethers.Wallet(privateKey, provider);
const UniswapV2Pair = require('./abis/IUniswapV2Pair.json');
const UniswapV2Factory = require('./abis/IUniswapV2Factory.json');
const ETH_TRADE = ethers.BigNumber.from(3)
const DAI_TRADE = 40;

// console.log(ethers.utils.parseEther(ETH_TRADE))

// console.log(ethers.utils.formatEther(ETH_TRADE))

  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

async function checkPair(args) {
  const {
    name,
    address
  } = args

  const sushiFactory = new ethers.Contract(
    '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    UniswapV2Factory.abi, wallet,
  );

  const uniswapFactory = new ethers.Contract(
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    UniswapV2Factory.abi, wallet,
  );

  // const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';

 
  const sushiPair = new ethers.Contract(
      await sushiFactory.getPair(wethAddress, address),
      UniswapV2Pair.abi, wallet,
  );

  const uniswapPair = new ethers.Contract(
      await uniswapFactory.getPair(wethAddress, address),
      UniswapV2Pair.abi, wallet,
  );

 

  const myBalance = await provider.getBalance(flashLoanerAddress)
  console.log("my balance", ethers.utils.formatEther(myBalance))
//   console.log(sushiPair)
//  console.log("END OF PAIR")
//   console.log("")
    // provider.on('block', async (blockNumber) => {
    //   // try {
    //     console.log(blockNumber);
    // })
        //get reserves
        const sushiReserves = await sushiPair.getReserves();
        const uniswapReserves = await uniswapPair.getReserves();


        const reserve0Sushi = Number(ethers.utils.formatUnits(sushiReserves[0], 18));
        const reserve1Sushi = Number(ethers.utils.formatUnits(sushiReserves[1], 18));
      
        const reserve0Uni = Number(ethers.utils.formatUnits(uniswapReserves[0], 18));
        const reserve1Uni = Number(ethers.utils.formatUnits(uniswapReserves[1], 18));

        const priceUniswap = reserve0Uni / reserve1Uni;
        const priceSushiswap = reserve0Sushi / reserve1Sushi;

        const shouldStartEth = priceUniswap < priceSushiswap;
        const spread = Math.abs((priceSushiswap / priceUniswap - 1) * 100) - 0.6;

        const shouldTrade = spread > (
          (shouldStartEth ? ETH_TRADE : DAI_TRADE) / Number(ethers.utils.formatEther(uniswapReserves[shouldStartEth ? 1 : 0])));
        
        console.table([{
          'Token': name,
          "Uniswap Price": priceUniswap,
          "Sushiswap Price": priceSushiswap,
          "Profitable?": shouldTrade,
          "Current Spread": `${((priceSushiswap/priceUniswap -1)*100)}%`,
          "Absolute Spread": `${spread}%`,
          'Timestamp': moment().tz('America/Los_Angeles').format()
        }])

        // if (!shouldTrade) return
        

        const dummyAddress = 0x1CCFBACD879967193967e6977AF400838900E146
        
        // const gasLimit = 21000
        // let gasPriceWei = ethers.BigNumber.from("20902747399");
        // const gasLimit = ethers.BigNumber.from("50000");

        // console.log(" gas limit")
        // console.log(ethers.utils.formatEther(gasLimit))
        // let maxCostWei = gasPriceWei.mul(gasLimit)


        // console.log("Max Cost: " + maxCostWei.toString());
        // "Max Cost: 62708242197000000"
        
        const gasLimit = await uniswapPair.estimateGas.swap(
      //     shouldStartEth ? DAI_TRADE : 0,
      //  !shouldStartEth ? ethers.utils.parseEther(ETH_TRADE) : 0,
      5, 0,
          flashLoanerAddress,
          ethers.utils.toUtf8Bytes('1'),
        );
        console.log("GAS LIMIT", gasLimit)

        const gasPrice = await wallet.getGasPrice();
        // console.log("Gas Price")
        //  console.log(ethers.utils.formatEther(gasPrice))
        // console.log(gasPrice)
        const gasCost = Number(ethers.utils.formatEther(gasPrice.mul(gasLimit)));
        // console.log("gasCost")
        // console.log(gasCost)
        // console.log(gasCost)
        // console.log(gasCost)
        // console.log(gasCost/ETH_TRADE)
        // console.log("here")
        // console.log(gasCost/ETH_TRADE)
        const shouldSendTx = shouldStartEth ? (gasCost/ETH_TRADE) < spread : (gasCost/ (DAI_TRADE/priceUniswap) ) < spread;
          // console.log("")
          // console.log(name)
          // console.log(shouldSendTx)
        // don't trade if gasCost is higher than the spread
        // if (!shouldSendTx) return;
        console.log(`Gas Price: ${gasPrice}`)
        console.log(`Gas Limit: ${gasLimit}`)
        console.log(`Should Start ETH? ${shouldStartEth}`)
        const options = {
          gasPrice,
          gasLimit,
        };
      
        console.log("")
        console.log("")
        console.log("")
        // const tx = await uniswapPair.swap(
        //   shouldStartEth ? DAI_TRADE : 0,
        //   !shouldStartEth ? ethers.utils.parseEther(ETH_TRADE) : 0,
        //   flashLoanerAddress,
        //   ethers.utils.toUtf8Bytes('1'), options,
        // );

    //     console.log('ARBITRAGE EXECUTED! PENDING TX TO BE MINED');
    //     console.log(tx);

    //     await tx.wait();

      //   console.log('SUCCESS! TX MINED');
      // } catch (err) {
      //   console.error(err);
      // }
    // });

  // })
}






let priceMonitor
let monitoringPrice = false







const monitorPrice = async () => {

  // const balance = await provider.getBalance(flashLoanerAddress)
  // console.log(Number(ethers.utils.formatUnits(balance, 18)))

  if(monitoringPrice) {
      return
    }

    console.log("Checking prices...")
    monitoringPrice = true

    try {

      await checkPair({
        name: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f"
      })

      // await checkPair({
      //   name: "LINK", address: "0x514910771af9ca656af840dff83e8264ecf986ca"
      // })

      // await checkPair({
      //   name: "BOR", address: "0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9"
      // })


      // await checkPair({
      //   name: "COMP", address: "0xc00e94cb662c3520282e6f5717214004a7f26888"
      // })
      

    } catch (error) {
      console.error(error)
      monitoringPrice = false
      clearInterval(priceMonitor)
      console.log("FUCK")
      return
    }

    monitoringPrice = false

    
};


console.log('Bot started!');


const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 3000 // 3 Seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)


// 595 113 724 754 824 851 8
// 599 762 367 762 422 431 186

