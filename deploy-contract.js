/* eslint-disable */
const { Conflux } = require('js-conflux-sdk');
const MAIN_PRIVATE_KEY = '0xxxxxxxxxx';
const testNetUrl = 'http://testnet-jsonrpc.conflux-chain.org:12537'

async function main() {
  const cfx = new Conflux({
    url: testNetUrl,
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
  });

  const account = cfx.Account(MAIN_PRIVATE_KEY); // create account instance
  console.log(account.address);

  // ================================ Contract ================================
  // create contract instance
  const contract = cfx.Contract({
    abi: require('./contracts/coin.abi.json'),
    bytecode: require('./contracts/coin.bin.json'),
  });

  // estimate deploy contract gas use
  const estimate = await contract.constructor().estimateGasAndCollateral();
  console.log(JSON.stringify(estimate));

  // deploy the contract, and get `contractCreated`
  const receipt = await contract.constructor()
    .sendTransaction({ from: account })
    .confirmed();
  console.log(receipt); 
}

main().catch(e => console.error(e));
