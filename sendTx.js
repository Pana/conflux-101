const { Conflux, util } = require('js-conflux-sdk');

async function main() {
  const TestNetUrl = 'http://testnet-jsonrpc.conflux-chain.org:12537';
  // initiate a Conflux object
  const cfx = new Conflux({
    url: TestNetUrl,
    defaultGasPrice: 100, // The default gas price of your following transactions
    defaultGas: 1000000, // The default gas of your following transactions
    logger: console,
  });

  // account private key
  const PRIVATE_KEY = '0xxxxxxxxxxxx';  
  const account = cfx.Account(PRIVATE_KEY); // create account instance
  const receiver = '0x13d2bA4eD43542e7c54fbB6c5fCCb9f269C1f94C';

  let txParams = {
      from: account, // from account instance and will by sign by account.privateKey
      to: receiver, // accept address string or account instance
      value: util.unit.fromCFXToDrip(0.125), // use unit to transfer from 0.125 CFX to Drip
  };
  // send transaction
  const txHash = await cfx.sendTransaction(txParams);
  console.log(txHash);
}
  
main().catch(e => console.error(e));