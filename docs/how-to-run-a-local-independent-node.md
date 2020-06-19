# 如何启动一个本地独立节点（用于合约开发）

智能合约开发过程中，通常需要本地运行一个独立节点，用于合约部署和调试，不仅方便，快速，还能节省部署费用。做过以太坊合约开发的同学肯定对 geth 或 ganache 非常熟悉，conflux-rust 是使用 Rust 语言开发的 Conflux Protocol 实现，相当于以太坊的 geth。Conflux 最近主网一阶段 Pontus 已经上线，意味着其线上智能合约运行环境已经稳定，熟悉智能合约开发或感兴趣的小伙伴可以来体验一下 Conflux 飞一样的感觉。本文会带你使用 conflux-rust 运行一个本地的独立节点（私联），并对它提供的丰富丰富功能一一介绍。

### 如何运行本地节点（独立）
Conflux 客户端可以自行编译或到 Github 上直接下载二进制程序，本文不再详细介绍，官方文档有详细说明。
下载好 conflux 程序后，首先我们需要一个节点运行的配置文件（toml 格式文件），配置文件的模板可以从[这里获取](https://github.com/Conflux-Chain/conflux-rust/blob/master/run/default.toml)。
然后对文件中的几项配置做相应更改：

1. ```bootnodes``` 置空或注释掉（因为是独立节点）
2. ```mode=dev``` 运行模式设置为 dev
3. ```dev_block_interval_ms=260```（可选） block 生成间隔，dev 模式下 conflux 会自动每隔一段时间生成一个block。
4. ```mining_author``` 挖矿账号，该账号会受到节点挖矿奖励
5. ```jsonrpc_http_port=12537``` 或 ```jsonrpc_local_http_port=12539``` 本地 rpc 端口配置

修改完之后使用如下命令启动：

```sh
$ ./conflux --config development.toml
```

如果一切顺利，我们会在终端看到日志输出，这时节点已经自动开始挖矿（产生block），并会将奖励发给 mining_author 账号，你可以通过 Conflux Portal（连接本地rpc） 或命令行程序查询到该账号的余额不断增加。
至此我们运行起了一个可以用于智能合约开发的本地独立节点。你可以通过 ```localhost:12537``` 或 ```localhost:12539``` 调用 rpc 请求。

除此之外我们还可以通过 ```genesis_secret``` 选项指定一个存有私钥的文本文件（一行一个私钥），节点启动的时候会给每个账号分配 10000 CFX 代币。（需要手动生成私钥，而且这部分账号不会加载入本地账号列表中，即无法通过 account list 查看这些账号，除非手动 import 到本地）

另外 conflux 程序支持的配置项可以通过 ```./conflux -h``` 查看，配置项除了可以在配置文件设置外，还可以直接通过命令行参数直接指定，如果两者都有，以命令行参数为准。


### account sub command
conflux 程序除了用于运行节点外，还提供一系列子命令，用于管理账号，查询余额，发送查看交易等。首先我们来介绍账号管理功能。账号管理是一个二级命令，可以通过 ```./conflux account -h``` 查看使用方式。

```sh
USAGE:
    conflux account <SUBCOMMAND>

SUBCOMMANDS:
    import    Import accounts from JSON UTC keystore files to the specified --chain (default conflux)
    list      List existing accounts of the given --chain (default conflux).
    new       Create a new account (and its associated key) for the given --chain (default conflux).
```
我们看到一共是三个命令：new, list, import 分别对应账号的新建，展示，导入（支持 keystore 格式账号导入）。执行该命令不会发起 rpc 调用，因此不需要节点处于运行状态，创建的账号会存放在系统的一个固定目录。


### rpc sub command
除了 account 子命令，还有一个 rpc 子命令，顾名思义这个命令可以发起 rpc 调用，从而实现跟 conflux 节点交互，因此节点需要处于运行状态。通过 help 我们可以看到具体的命令 ```./conflux rpc -h``` 

```sh
conflux-rpc
RPC based subcommands to query blockchain information and send transactions

USAGE:
    conflux rpc [OPTIONS] <SUBCOMMAND>

OPTIONS:
        --url <url>    URL of RPC server [default: http://localhost:12539]

SUBCOMMANDS:
    balance                  Get balance of specified account
    best-block-hash          Get the best block hash
    block-by-epoch           Get block by epoch
    block-by-hash            Get block by hash
    block-with-assumption    Get block by hash with pivot chain assumption
    blocks                   Get blocks of specified epoch
    call                     Executes a new message call immediately without creating a transaction
    code                     Get bytecode of specified contract
    epoch                    Get epoch number
    estimate-gas             Executes a call request immediately without creating a transaction and returns the gas used
    local                    Local subcommands (requires jsonrpc_local_http_port configured)
    nonce                    Get nonce of specified account
    price                    Get recent mean gas price
    receipt                  Get receipt by transaction hash
    send                     Send a signed transaction and return its hash
    skipped-blocks           Get skipped blocks of specified epoch
    tx                       Get transaction by hash
```

rpc 提供的命令大都是我们智能合约开发过程中经常需要用到的，比如：

1. balance 获取账户余额
2. nonce 获取某个账号的下一个 nonce
3. estimate-gas 获取交易执行预估需要的 gas
4. epoch 获取最新的 epoch number
5. code 获取合约的 bytecode
6. block-by-epoch, block-by-hash 分别通过 epoch 和 hash 获取 block
7. send 发送一个 signed 的交易
8. tx 通过 hash 获取 tx
9. receipt 通过 hash 获取 tx 的 receipt
10. call 调用合约方法（不会真正创建交易）


### rpc local sub command
在 rpc 命令下边，还有一个 local 子命令，里面提供了更加丰富的功能，但需要节点启动时开启 ```jsonrpc_local_http_port``` 配置。

```sh
USAGE:
    conflux rpc local [OPTIONS] <SUBCOMMAND>

OPTIONS:
        --url <url>    URL of RPC server [default: http://localhost:12539]

SUBCOMMANDS:
    account                  Account related subcommands
    consensus-graph-state    Get the consensus graph state
    net                      Network subcommands
    send                     Send a transaction and return its hash
    sync-phase               Get the current synchronization phase
    test                     Test subcommands (used for test purpose only)
    txpool                   Transaction pool subcommands
```

1. 这里也有一个 account 子命令，它跟上边的不太一样，主要提供： new, list, unlock, lock 的功能
2. net 子命令提供了 node（获取node信息），session，disconnect，throttling 等功能
3. send 命令比较有用。用于发送一个交易，并且能分别指定交易的各个字段，然后会使用指定的账号私钥自动签名并发送（该账号需要在本地账号列表中）
```sh
$ conflux rpc local send -h
Send a transaction and return its hash

USAGE:
    conflux rpc local send [OPTIONS] --from <ADDRESS> --value <HEX>

OPTIONS:
        --data <HEX>         Hash of the method signature and encoded parameters
        --from <ADDRESS>     Transaction from address
        --gas <HEX>          Gas provided for transaction execution [default: 0x5208]
        --gas-price <HEX>    Transaction gas price [default: 0x2540BE400]
        --nonce <HEX>        Transaction nonce
        --to <ADDRESS>       Transaction to address (empty to create contract)
        --url <url>          URL of RPC server [default: http://localhost:12539]
        --value <HEX>        value sent with this transaction
```
4. test 里面提供了一些测试相关的命令，不过也都很有用
```sh
$ conflux rpc local test -h
USAGE:
    conflux rpc local test [OPTIONS] <SUBCOMMAND>

OPTIONS:
        --url <url>    URL of RPC server [default: http://localhost:12539]

SUBCOMMANDS:
    block-count    Get the total block count
    chain          List "ALL" blocks in topological order
    goodput        Get the recent transaction good TPS
    status         Get the current status of Conflux
    stop           Stop the conflux program
```
5. txpool 则提供了节点交易池的一些相关功能


### sendTransaction 和 sendRawTransaction
可能大家也都知道一般区块链 rpc 会提供两个发送交易的 method，即 sendTransaction，sendRawTransaction。
两者的区别是 sendRaw 调用时发送的是私钥签名并编码的 raw 格式的交易，而 sendTransaction 调用时则传递的是 tx 的 meta 信息（from，to，value 等），该 rpc 内部会使用其存储的账号（私钥）签名，然后发送出去。
Conflux 也提供了这两个接口分别是 send_transaction, cfx_sendRawTransaction, 但前者主要用于通过本地节点发送交易。

### 总结
本文主要介绍了如何启动一个用于智能合约开发的本地独立节点，未来官方或社区应该会提供 conflux 的 docker 镜像，届时启动一个本地节点会更加容易。另外 conflux 命令行提供了一系列实用功能，这些命令会贯穿合约开发的各个周期。

