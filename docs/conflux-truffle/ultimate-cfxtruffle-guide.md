cfxtruffle 使用完全指南
===
Truffle 是以太坊生态著名的智能合约开发工具，提供编译，链接，测试，部署等实用功能，为广大 Solidity 开发者所喜爱。
Conflux 作为新一代高性能公链，不仅在完全去中心化的前提下实现了两个量级的性能提升，还实现了跟 EVM 兼容的虚拟机，
意味着 Dapp 开发者不用学习新开发语言即可以在 Conflux 网络上开发应用。
为了提升 Conflux 的合约开发体验，官方最近也对 Truffle 进行了迁移改造，打造了 [Conflux-Truffle](https://www.npmjs.com/package/conflux-truffle)，使之能够支持 Conflux 的合约开发。
本文会详细介绍如何使用 Conflux Truffle 开发 Conflux 智能合约，从环境搭建，创建项目，开发，编译，测试，部署，一一介绍。

1. 基本概念介绍
2. Dependencies 准备
3. 使用 cfxtruffle 开发智能合约
4. 参考文档


## 基本概念介绍
区块链的世界是去中心化的，所有参与的节点具有相同的数据，人人平等。而数据在区块链上的组织形式是：首先多笔交易被一块打包形成一个区块(block)，
区块之间根据先后顺序链接起来，形成一条链，因此叫区块链(blockchain)。最初的区块链（bitcoin chain）只支持转账，因此只有一个应用（bitcoin）。
以太坊开创性的添加了 EVM 的功能，具备了图灵完整性，因此在其上可以自由开发各种去中心化应用（Dapp）。

### Epoch & storageLimit
传统的区块链账本是一条单链，从前往后每个区块都有一个编号，叫做区块号（ block number），conflux 通过一种全新的账本结构-树图，实现了高吞吐。

![](https://developer.conflux-chain.org/img/tree_graph.jpg)

在树图账本结构中，如果只看父边他是一个 Tree，如果父边引用边都看则是一个 Graph。正是这种结构使得 conflux 网络可以并发出块，也就是多个区块可以
同时在某个区块之后生成。因此在 Conflux 是没有 block number 的概念。
但为了实现全序，Conflux 通过 GHAST 规则认定从创世区块开始，在其所有子区块中的具有最重子树 block 为 pivot block，所有的 pivot block 链到一块也形成一条链
定义为 pivot chain，如果只看 pivot chain 其跟普通的区块链结构一致，在这条链上的每个 block 定义一个 Epoch（纪元），因此你可以把 conflux 中的
Epoch 理解为跟 block number 对应的概念，只不过区别是 conflux 中的每个 epoch 中可能会有多个 block。

在现实世界中，发送转账交易需要给银行付手续费，在比特币中发送交易需要给矿工付手续费，在以太坊中同样如此。具体来讲，以太坊网络的交易最终是由矿工
之上运行的 EVM 执行的，gas 是用来衡量一笔交易执行的具体工作量（可以理解为工作的工时），交易发送者，发送交易时可以指定愿意给每个工作量付的价格即 gasPrice。
因此最终一笔交易的手续费= gas * gasPrice。
在发送一笔交易时指定的 gas 则是一个限制值，即发送方最大愿意为一笔交易支付 gas 这么多的费用，如果交易需要的工作量超过 gas，则不会再付钱，因此交易不会被执行。

在 Dapp 系统中，交易执行除了需要矿工进行计算付出计算资源外，还需要矿工存储合约的状态，因此需要付出存储资源。在 Conflux 系统中发送交易时，还需要为状态存储
抵押一部分费用，因此在 conflux 中发送交易时会比以太坊多一个 storageLimit 参数，用于设置愿意为某笔交易存储所抵押的费用上限。

### Dapp
传统 App 的所有状态都存储于中心化服务器的数据库上，其状态的查询和修改，直接通过 API 到数据库中执行 SQL 操作即可，虽然速度快，但具有数据随便篡改，隐私泄露等问题。
Dapp 是运行于区块链系统之上的应用，被称为去中心化应用。应用状态存储于区块链系统之上，只能通过网络节点查询，以及通过发送交易的形式修改状态。

![](./traditional-vs-dapp.jpg)

### Wallet
在传统互联网应用中，是通过账号访问服务的，但数据本质存储于服务提供商的服务器上。在区块链世界中一切的交易发送都需要通过钱包来实现，比如以太坊的 MetaMask，Conflux 的 portal。
在钱包中你可以查看余额，发送交易，与Dapp交互，领取测试网代币等。
更本质的其实是，钱包中存有你账户的私钥，在区块链世界中只有私钥可以签名发送交易。私钥只应该被你自己所保有，不能被别人知道。


## Dependencies 准备
在进行智能合约开发前，需要先准备一些开发环境.

### NPM
npm 是 node.js 的包管理工具，因为 cfxtruffle 是使用 node 开发，所以需要使用 npm 安装。
npm 包含在 node 的安装包中，只要 node 安装成功，npm 也就安装成功了。
安装 node 可以直接下载[官方](https://nodejs.org/en/)的安装包，或者使用 [nvm](https://github.com/nvm-sh/nvm)，
安装好之后，可以使用如下命令查看版本：

```sh
$ node -v
$ npm -v
```

### cfxtruffle
npm 安装成功之后，就能安装 cfxtruffle 了。
```sh
$ npm install -g conflux-truffle
$ cfxtruffle -v
```

有两点需要注意的地方：
1. npm install 的时候需要通过 -g 指定全局安装
2. npm install 包的名字为 `conflux-truffle`, 安装后的命令行程序为 `cfxtruffle`

### conflux-rust docker
开发合约调试需要运行本地节点，运行 conflux 最简单的方法是使用 docker 运行 [conflux-rust](https://hub.docker.com/repository/docker/confluxchain/conflux-rust) 镜像，不需要自己编译程序，或设置配置文件。只需要本地安装有 docker 环境即可。

```sh
# 下载 conflux-rust docker 镜像
$ docker pull confluxchain/conflux-rust
# 启动节点
$ docker run -p 12537:12537 --name cfx-node confluxchain/conflux-rust
```
简单一个命令即可启动一个本地 Conflux 节点，并且该节点会预先创建 10 个本地账号，每个账号分配 1000 CFX 用于合约部署和交互，且这些账号会自动 unlock。
docker 镜像运行之后，可以直接被 cfxtruffle 用于合约的部署和交互。

当然也可以自己编译或下载节点程序，自定义配置文件，然后运行本地节点，具体可参看[这篇介绍](https://github.com/Pana/conflux-101/blob/master/docs/how-to-run-a-local-independent-node.md)。
当然节点运行起来之后需要手动创建本地账号，并转账给他们使之有余额，以及手动进行解锁。

说明：
1. 本地账号一般使用节点命令行或rpc 创建，可以被节点程序访问到。
2. 本地账号可以直接通过 `cfx_sendTransaction` 发送交易，交易的签名操作由节点完成，不需要事先签名，本地开发 Dapp 非常方便。
3. 本地账号为了安全，需要解锁才能直接发送交易，可以在调用 `cfx_sendTransaction` 时通过第二个参数传递密码， 也可以事先调用 unlock rpc 解锁账号。
4. 目前的 cfxtruffle 需要 0.6.0 以上版本的 docker 搭配使用。

### conflux portal
[Conflux portal](https://portal.conflux-chain.org/) 是一款浏览器插件钱包，支持 Chrome 和 Firefox 等浏览器。在官网点击链接即可下载安装（可能需要翻墙）。

![](./portal-home.png)

安装后该钱包可切换不同 conflux 网络， 当然也可以连接本地网络，并且可以申领测试网络代币，如果合约本地测试完之后，可部署到测试网络测试。

## How to develop conflux dapp with cfxtruffle
环境准备好之后，可以使用 cfxtruffle 开发智能合约了，接下来我们来具体看下如何使用 cfxtruffle 开发一个具有铸币和转账功能的 coin 合约。

查看 cfxtruffle 所有命令:
```sh
$ cfxtruffle -h
Usage: cfxtruffle <command> [options]

Commands:
  compile   Compile contract source files
  config    Set user-level configuration options
  console   Run a console with contract abstractions and commands available
  create    Helper to create new contracts, migrations and tests
  debug     Interactively debug any transaction on the blockchain
  deploy    (alias for migrate)
  exec      Execute a JS module within this Conflux-Truffle environment
  help      List all commands or provide information about a specific command
  init      Initialize new and empty Conflux project
  install   Install a package from the Conflux Package Registry
  migrate   Run migrations to deploy contracts
  networks  Show addresses for deployed contracts on each network
  obtain    Fetch and cache a specified compiler
  opcode    Print the compiled opcodes for a given contract
  publish   Publish a package to the Conflux Package Registry
  run       Run a third-party command
  test      Run JavaScript and Solidity tests
  unbox     Download a Conflux-Truffle Box, a pre-built Conflux-Truffle project
  version   Show version number and exit
  watch     Watch filesystem for changes and rebuild the project automatically

See more at http://truffleframework.com/docs
```

查看某个命令如何使用
```sh
$ cfxtruffle help create
```

### 创建项目
开发合约的第一步是创建一个 cfxtruffle 项目。
```sh
# 创建一个空项目
$ cfxtruffle init project-name
# 查看项目目录结构
$ cd project-name && tree
.
├── contracts
│   └── Migrations.sol
├── migrations
│   └── 1_initial_migration.js
├── test
└── truffle-config.js

3 directories, 3 files
```

* `contracts` solidity 合约代码目录
* `migrations` 合约部署迁移脚本目录
* `test` 单元测试目录
* `truffle-config.js` cfxtruffle 配置文件（js 文件）

另外 cfxtruffle 也提供了许多项目模板（box），使用模板的项目框架，会节省许多初始化操作：

```sh
$ mkdir project-name && cd project-name
$ cfxtruffle unbox metacoin
```
官方模板列表在[这里](https://www.trufflesuite.com/boxes)

注：这两个命令，在国内可能需要翻墙。

### 添加合约，test，migration
init 命令会创建一个空项目，里面包含一个基础的 Migrations 合约及它的迁移脚本。
现在让我们来用 `create` 命令添加一个新的合约。
其使用方式为： `cfxtruffle create <artifact_type> <ArtifactName>`
artiface_type 可以是： contract, migration, test

```sh
$ cfxtruffle create contract Coin
```
以上命令执行完之后, 会在 contracts 目录创建一个 Coin.sol 文件，我们会在其中加入以下 solidity 代码。
这是一个简单的 Coin 合约，其实现了铸币，转账，余额查询的功能。

```js
pragma solidity ^0.5.10;

contract Coin {
    // An `address` is comparable to an email address - it's used to identify an account on Ethereum.
    // Addresses can represent a smart contract or an external (user) accounts.
    // Learn more: https://solidity.readthedocs.io/en/v0.5.10/types.html#address
    address public owner;

    // A `mapping` is essentially a hash table data structure.
    // This `mapping` assigns an unsigned integer (the token balance) to an address (the token holder).
    // Learn more: https://solidity.readthedocs.io/en/v0.5.10/types.html#mapping-types
    mapping (address => uint) public balances;

    // Events allow for logging of activity on the blockchain.
    // Ethereum clients can listen for events in order to react to contract state changes.
    // Learn more: https://solidity.readthedocs.io/en/v0.5.10/contracts.html#events
    event Transfer(address from, address to, uint amount);

    // Initializes the contract's data, setting the `owner`
    // to the address of the contract creator.
    constructor() public {
        // All smart contracts rely on external transactions to trigger its functions.
        // `msg` is a global variable that includes relevant data on the given transaction,
        // such as the address of the sender and the ETH value included in the transaction.
        // Learn more: https://solidity.readthedocs.io/en/v0.5.10/units-and-global-variables.html#block-and-transaction-properties
        owner = msg.sender;
    }

    // Creates an amount of new tokens and sends them to an address.
    function mint(address receiver, uint amount) public {
        // `require` is a control structure used to enforce certain conditions.
        // If a `require` statement evaluates to `false`, an exception is triggered,
        // which reverts all changes made to the state during the current call.
        // Learn more: https://solidity.readthedocs.io/en/v0.5.10/control-structures.html#error-handling-assert-require-revert-and-exceptions

        // Only the contract owner can call this function
        require(msg.sender == owner, "You are not the owner.");

        // Ensures a maximum amount of tokens
        require(amount < 1e60, "Maximum issuance succeeded");

        // Increases the balance of `receiver` by `amount`
        balances[receiver] += amount;
    }

    // Sends an amount of existing tokens from any caller to an address.
    function transfer(address receiver, uint amount) public {
        // The sender must have enough tokens to send
        require(amount <= balances[msg.sender], "Insufficient balance.");

        // Adjusts token balances of the two addresses
        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        // Emits the event defined earlier
        emit Transfer(msg.sender, receiver, amount);
    }
}
```

该合约具体属性和方法如下：

* owner属性 合约所有者
* balances属性 余额，map 类型
* constructor 方法
* mint 铸币方法
* transfer 转账方法
* Transfer 事件
* balances 方法，可以查询余额
* owner 方法，可以查询合约的所有者

### compile
solidity 代码不能直接部署，需要编译，生成 bytecode 和 abi 信息，然后才能部署。
cfxtruffle 集成了编译功能 `compile`，不需要再单独安装 solc 编译器。

```sh
# 编译合约
$ cfxtruffle compile
# 首次执行，会创建一个 build 目录，编译后的内容会保存在对应的 json 文件中。
```
生成的 json 文件中，包含有合约编译后的 bytecode，abi，ast，name 等信息，该文件在之后的部署，调试等步骤中都会被用到。

### truffle-config.js

在 cfxtruffle 项目中有一个文件 `truffle-config.js` 非常重要，这个是项目的配置文件，cfxtruffle 运行的时候会读取这里的配置。

```js
module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 12537,            // Standard Conflux port (default: none)
     network_id: "*",       // Any network (default: none)
    },
  },
}
```
其中最重要的配置项为 networks，用于配置 cfxtruffle 部署交互的网络，development 作为默认的网络使用。
除此之外，还可以配置测试，compiler 等信息，具体参看[官方文档](https://www.trufflesuite.com/docs/truffle/reference/configuration)

### 部署到本地节点
在 cfxtruffle 中使用 `deploy` 或 `migrate` 命令部署合约，这两个命令本质相同。
在所有 cfxtruffle 项目中都会有一个 `Migrations.sol`，该合约用于在链上记录合约的部署序号（整数序号）。
每次 deploy 命令执行时会到链上查询上次部署的位置，然后判断是否有新合约需要更新。
```js
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}
```
cfxtruffle 使用 migrations 中的脚本管理合约的部署，每个合约会在该文件夹中有一个对应的脚本。
现在让我们先来添加一个 Coin 合约的部署脚本

```sh
$ cfxtruffle create migration Coin
# 生成的 migration 脚本文件名中，会包含一个时间戳数字，我们需要手动改为递增的序号比如 2_coin.js
```
然后可以在里面加入如下代码
```js
// require the Coin artifact
const Coin = artifacts.require("Coin")
module.exports = function(deployer) {
  // when run `deploy` command, will execute code here
  deployer.deploy(Coin);
};
```

设置完成之后可以运行部署命令了
```sh
$ cfxtruffle deploy

2_coin.js
=========

   Deploying 'Coin'
   ----------------
   > transaction hash:    0xd001fb34df8e634e21d7d225bfd0da6128237cd74f170fbc97ad820098ceaeff
   > Blocks: 0            Seconds: 0
   > contract address:    0x8DCe85c454d401318C03956529674b9E2B8E8680
   > block number:        1608
   > block timestamp:     1595475207
   > account:             0x1357DA1577f40EE27aE8870C7f582bD345C65A1c
   > balance:             997.71313608
   > gas used:            437390 (0x6ac8e)
   > gas price:           20 GDrip
   > value sent:          0 CFX
   > total cost:          0.0087478 CFX


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:           0.0087478 CFX


Summary
=======
> Total deployments:   2
> Final cost:          0.01221746 CFX
```

deploy 命令执行完成之后，会输出部署的结果，比如交易hash，合约地址，花费的费用等。


### 合约交互

### 合约测试

### 部署到远端节点


## 参考

1. [truffle 文档]()
2. [conflux-rust docker]()
3. [conflux rpc]()
4. [如何运行一个 conflux 本地节点]()
5. [Solidity 文档]()
6. [js-conflux-sdk]()
7. [conflux portal]()
8. [conflux scan]()