const { Conflux, util } = require('js-conflux-sdk');

async function main() {

  const cfx = new Conflux({
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
  });

  const contractAddress = '0x8a43514200778e9ff023039b55ca3192064f8e44';
  const contract = cfx.Contract({
    abi: require('./contracts/coin.abi.json'),
    address: contractAddress,
  });

  let address = '0x1386B4185A223EF49592233b69291bbe5a80C527';

  let ret;
  // get balanceOf of address
  ret = await contract.balanceOf(address); 
  console.log(ret.toString());

}

main().catch(e => console.error(e));
