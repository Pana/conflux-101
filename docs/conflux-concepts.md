conflux 相关概念
===

### 树图
DAG(有向无环图)是一种新式的区块链账本结构，与通常的比特币链式结构有很大差别。DAG的优势在于可以并发出块（因为前后两个区块中的 tx 大多并无直接关系），提高区块链系统的吞吐率。
在 Conflux 的账本结构中，block 和 block 之间的关系有两种：实边(父边)和虚边，两种边所起到的作用各不相同，如果只看父边整个账本结构是一个树形结构，如果所有边都看则是一个图结构，因此起名叫做树图。

![](https://developer.conflux-chain.org/img/tree_graph.jpg)

树图是对 Conflux 账本结构的命名，也正是因此种账本结构，Conflux 可以实现远高于 BTC 和 ETH 的吞吐率。

### Epoch
在树图账本结构基础之上，Conflux 还创新了其共识协议 GHAST，只看实边，从创世区块开始，每次在子区块中选择最重子树作为 Pivot 区块，所有 Pivot 区块相连，构成树图中的 Pivot chain，而在 Pivot chain 上的每个 Pivot block 则定义了一个 Epoch（朝代，纪元），而被某个 Pivot block 虚边引用的 Block 也属于该 Epoch。

在 Conflux 中没有 block number 的概念，但有 Epoch number 概念，不同的是一个 Epoch 中会有多个 block。
在 Tx 信息中也没有 block number 字段，只能通过其 block hash 获取其所在 block 的信息。

### storageLimit
Conflux 的虚拟机兼容以太坊合约，与之对应的是在创建 Tx 的时候也可以指定 gas 和 gasPrice，但 Conflux 同时支持对合约交互的存储使用设定上限即 storageLimit。
此参数的作用跟 gas 之类，只不过是用于限制存储使用。同时 Conflux 也提供了 RPC (cfx_estimateGasAndCollateral) 用于对 gas 和 storageLimit 进行预估。
一般该参数在创建合约，合约交互的时候需要设置。

### Sponsor 机制

在以太坊中与合约交互只能自己承担交易的 gas 费用，Conflux 创新性的提出了 sponsor 机制，即允许别人为你代付交易的 gas 费用，该机制是通过内置合约实现的，具体可参看[这里](https://developer.conflux-chain.org/docs/conflux-rust/internal_contract/internal_contract)


### 发送交易需要传递的参数

* `from` 交易的发送发地址
* `to`（可选） 交易的接收方，如果是创建合约则为空
* `value` 交易金额, hex形式，单位Drip 
* `data`（可选） 交易附带数据，创建合约，合约交互需要传递此字段
* `gas`（可选） 交易允许花费的 gas 上限，交易执行需要花费 gas，可以通过 estimate接口获取预估数量（该预估数量有时会偏低，可以适当变大比如乘上1.2）
* `gasPrice`（可选） 交易支付的 gas 价格
* `storageLimit`（可选） 交易允许的存储上限
* `chainId`（可选） 链的id，通常用于处理硬分叉或交易重放
* `epochHeight`（可选） 超时机制，只有当前 epoch 处于 [epochHeight-10000, epochHeight+10000] 才会被打包，一般将交易设为当前 epoch
* `nonce`（可选） 用于保证交易的顺序， nonce 从小到大递增，可使用 cfx_getNextNonce 获取当前账户的下一个可用 nonce

TODO：添加类型，参数的可选性校验，交易失败的原因。

### block 包含字段

```js
{
  "adaptive": false,
  "blame": "0x0",
  "deferredLogsBloomHash": "0xd397b3b043d87fcd6fad1291ff0bfd16401c274896d8c63a923727f077b8e0b5",
  "deferredReceiptsRoot": "0x09f8709ea9f344a810811a373b30861568f5686e649d6177fd92ea2db7477508",
  "deferredStateRoot": "0x922b596e181a48112924a2482d73dd405ec27d76c3baa1e22e51ca9bc41acde0",
  "difficulty": "0x4",
  "epochNumber": "0x143164",
  "gasLimit": "0x1c9c380",
  "hash": "0xb174d67e79ccf5b7a834104650e5144e2d66d2938b3ad4a67a10cab6a6bd0c3c",
  "height": "0x143164",
  "miner": "0x0000000000000000000000000000000000000000",
  "nonce": "0x7eaf7427adba0e9c",
  "parentHash": "0x892ee574e728619121de2336c371bd38460b527384a30a83171758d6ba162362",
  "powQuality": "0x72",
  "refereeHashes": [],
  "size": "0x0",
  "timestamp": "0x5f0d4fb1",
  "transactions": [],
  "transactionsRoot": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
}
```

* `adaptive` If true the weight of the block is adaptive under GHAST rule, if false otherwise
* `blame` If 0, then no blocks are blamed on its parent path, If greater than 0, then the nearest blamed block on the parent path is blame steps away.
* `refereeHashes` 引用边
* `parentHash` 父边

[block intro](https://developer.conflux-chain.org/docs/conflux-doc/docs/json_rpc#cfx_getblockbyhash)

### tx 包含字段

```js
{
  "blockHash": null,
  "chainId": "0x0",
  "contractCreated": null,
  "data": "0x",
  "epochHeight": "0x1427d8",
  "from": "0x1386b4185a223ef49592233b69291bbe5a80c527",
  "gas": "0x5208",
  "gasPrice": "0x3b9aca00",
  "hash": "0x12ca70c82b31bfc46f9af5ad1c2328aaebcc83e6b089d6dd50273435b218c2e1",
  "nonce": "0xf",
  "r": "0x50f2e88e4c2bc807519d4e48e893fecee015fe56092dfddd3b6e2f9ce98cdedc",
  "s": "0x3c5f5d2f95758ceee2460180b44390537ea07d1b3b1bcbec64b240e3c480d8b2",
  "status": null,
  "storageLimit": "0x0",
  "to": "0x10be81743fbbd3c61cdb6680833626ffec0a4f86",
  "transactionIndex": null,
  "v": "0x0",
  "value": "0x8ac7230489e80000"
}
```

* r,s,v 交易签名部分
* contractCreated 合约创建地址
* data 交易的数据
* epochHeight 目标纪元
* status 交易的状态 0x0 成功, 0x1 失败，null 被跳过或未被打包

[rpc tx doc](https://developer.conflux-chain.org/docs/conflux-doc/docs/json_rpc#cfx_gettransactionbyhash)

### tx receipt 包含字段

```js
{
    "blockHash": "0xbb1eea3c8a574dc19f7d8311a2096e23a39f12e649a20766544f2df67aac0bed",
    "contractCreated": null,
    "epochNumber": 451990,
    "from": "0xb2988210c05a43ebd76575f5421ef84b120ebf80",
    "gasUsed": "0x5208",
    "index": 0,
    "logs": [],
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "outcomeStatus": 0,
    "stateRoot": "0x1bc37c63c03d7e7066f9427f69e515988d19ebb26998087d75b50d2235e55ee7",
    "to": "0xb2988210c05a43ebd76575f5421ef84b120ebf80",
    "transactionHash": "0x53fe995edeec7d241791ff32635244e94ecfd722c9fe90f34ddf59082d814514"
  }
```

* outcomeStatus tx执行的结果，0x0 成功 0x1 失败
* contractCreated 创建合约的地址

[rpc receipt doc](https://developer.conflux-chain.org/docs/conflux-doc/docs/json_rpc#cfx_gettransactionreceipt)