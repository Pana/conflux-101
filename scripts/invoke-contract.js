const { Conflux, util } = require('js-conflux-sdk');

async function main() {
const PRIVATE_KEY = '0xxxxxxxx';
	const cfx = new Conflux({
		url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
		defaultGasPrice: 100,
		defaultGas: 1000000,
		logger: console,
	});

	const account = cfx.Account(PRIVATE_KEY); // create account instance

	const contractAddress = '0x8758f4f1ba9ee18b10fb945fb74be643ecd4b9fe';
	const contract = cfx.Contract({
		abi: require('../contracts/coin.abi.json'),
		address: contractAddress,
	});

	let address = '0x1292d4955bb47F5153B88Ca12C7A9E4048f09839';

	let ret;
	ret = await contract.mint(address, 100).sendTransaction({
			from: account,
	}).confirmed();
	console.log(ret.toString());

	ret = await contract.balances(address); 
	console.log(ret.toString());
}

main().catch(e => console.error(e))