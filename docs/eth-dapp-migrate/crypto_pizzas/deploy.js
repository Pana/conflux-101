const {Conflux, util} = require('js-conflux-sdk');
const url = "http://mainnet-jsonrpc.conflux-chain.org:12537";
const privateKey = "0x35D29A5A56DB5C87FD257DC0EE83799F8D12D20C6BCBF5E8927218BB436FDA3D";
const fs = require('fs');

const cfx = new Conflux({
    url,
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
});

const account = cfx.Account(privateKey); // create account instance

async function deploy() {
    let abi = JSON.parse(fs.readFileSync('./build/contracts/CryptoPizza/CryptoPizza.abi'));
    let bytecode = fs.readFileSync('./build/contracts/CryptoPizza/CryptoPizza.bin');
    const contract = cfx.Contract({
        abi,
        bytecode,
    });
    
    // estimate deploy contract gas use
    const estimate = await contract.constructor().estimateGasAndCollateral();
    console.log(JSON.stringify(estimate)); // {"gasUsed":"175050","storageCollateralized":"64"}
    
    // deploy the contract, and get `contractCreated`
    const receipt = await contract.constructor()
        .sendTransaction({ from: account })
        .confirmed();
    console.log(receipt); // receipt.contractCreated: 0x8de528bc539e9be1fe5682f597e1e83f6b4e841b
}

async function main() {
    await deploy();
}


main().catch(e => console.error(e));