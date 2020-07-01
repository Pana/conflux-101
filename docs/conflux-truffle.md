Conflux-truffle
===
以太坊毋庸置疑拥有现在最活跃，最繁荣的区块链生态。其智能合约开发语言，IDE，及各种工具层出不穷且更加成熟。
[Conflux](https://confluxnetwork.org/) 作为新一代公链，相比以太坊在性能上有巨大（两个量级）的提升，并且其智能合约 VM 完全兼容 EVM。
因此以太坊的开发生态可以复用过来，比如同样使用 Solidity 开发合约，甚至以太坊的合约大多可以直接部署到 Conflux 上。
[Truffle](https://www.trufflesuite.com/) 是一个世界级的以太坊智能合约环境（工具）提供合约编译，链接，部署，测试等功能。是一款智能合约开发利器。
为了简化 Conflux 合约开发工作，小伙伴对 Truffle 进行了简单的改造（Conflux-Truffle），可以提供相同的功能和体验，如果你是一个以太坊开发者，
那么用 truffle 你可以无缝开发 Conflux 合约。

![](../images/conflux&truffle.png)

## [Conflux-Truffle](https://www.npmjs.com/package/conflux-truffle) 安装
Conflux-Truffle 是对 truffle 的一个简单化改造，以支持 Conflux 的智能合约开发，目前其是一个单独的 npm module 和 命令。
同样使用 npm 安装：

```sh
$ npm install -g conflux-truffle
```

安装成功后，你就可以使用命令 cfxtruffle 进行智能合约开发工作了，比如：

```sh
$ cfxtruffle -h
```

## 运行本地节点
智能合约开发，本地节点是必须的，truffle 套件中提供了 Ganache，这是一个以太坊本地节点，开发非常方便，Conflux 目前提供了智能合约开发的 Docker 镜像 [confluxchain/conflux-rust](https://hub.docker.com/r/confluxchain/conflux-rust)，也可以非常方便的启动本地节点。

```sh
# 下载镜像
$ docker pull confluxchain/conflux-rust
# 运行节点
$ docker run -p 12537:12537 --name cfx-node confluxchain/conflux-rust
```

镜像运行时也可以挂载本地目录（目录中需包含文件：default.toml, log.yaml, throttling.toml），这样可以使用自定义配置文件，节点运行的数据也会保存到本地目录中，container 删掉重启数据也可以保留。
```sh
# 使用本地配置运行节点
$ docker run -p 12537:12537 -v $(pwd)/run:/root/run --name cfx-node confluxchain/conflux-rust
```

注意：该镜像首次启动时，会自动创建 10 个账号，每个账号会分配 1000 CFX，可以用于测试，该进行默认以 dev 模式运行，当然你也可以使用自定义配置，但目前`不建议`使用该镜像运行`正式环境`节点。

如果电脑没有 Docker 环境或对 Docker 不熟悉，可以直接下载或编译 Conflux 节点程序，本地运行，具体方法可参看[这里](./docs/how-to-run-a-local-independent-node.md)。（节点起来之后需要通过 conflux account new 创建几个账号，并转一些 CFX）


## cfxtruffle 使用的区别

cfxtruffle 的总体使用方法与 truffle 保持一致，只需要在 `truffle-config.js` 配置文件中做一些配置修改。主要包含两点：
1. 将  `network` 设置为 `conflux`
2. 使用自定义 provider `web3-providers-http-proxy`

具体可参看如下示例：

```js
// before use you need npm install this module: `npm i web3-providers-http-proxy`
const {HttpProvider, ethToConflux} = require('web3-providers-http-proxy');

module.exports = {
    networks: {
        development: {
        host: "127.0.0.1",     
        port: 12537,      // 本地节点的地址和端口号     
        network_id: "*",       
        type: "conflux",  // type 设为 conflux
        provider: function() {
        const provider = new HttpProvider('http://localhost:12537', {
            chainAdaptor: ethToConflux
        });
        return provider;
        }
        },
    }

    // other configs
    ...
}
```

## cfxtruffle 使用简介
这里对使用 cfxtruffle 开发的流程做一个简单的介绍，如果你对 truffle 已经很熟悉，可以直接跳过。

#### 创建项目
创建空项目
```sh
$ cfxtruffle init 
```
另外 truffle 也提供了许多项目模板叫做 [box](https://www.trufflesuite.com/boxes)，可以使用 unbox 命令下载模板，快速开发

```sh
$ mkdir MetaCoin
$ cd MetaCoin
$ cfxtruffle unbox metacoin
```

创建的项目目录内容如下:

* build 存放合约编译后的文件（json）
* contracts 合约代码目录
* migrations 合约迁移脚本目录 （js 脚本）
* test 测试文件
* truffle-config.js 配置文件

#### 添加合约 or 迁移脚本 or test

cfxtruffle create 可以用于创建新的合约文件
```sh
$ cfxtruffle create contract MetaCoin
$ cfxtruffle create migration MetaCoin
$ cfxtruffle create test MetaCoin
```
命令执行后创建的文件在对应的目录中。另外生成的 migrate 脚本文件名中包含一个时间戳，需要手动将其改为脚本中下一序号，具体原因参看[这里](https://www.trufflesuite.com/docs/truffle/getting-started/running-migrations#migration-files)

#### 编译合约

```sh
$ cfxtruffle compile
```
编译后的内容会存放在 build 目录中。

#### 部署合约

```sh
$ cfxtruffle deploy # or cfxtruffle migrate
```
deploy 跟 migrate 本质上是一个命令，truffle 使用 migration 脚本的方式管理合约的部署和迁移，具体来说

1. migration 文件夹中的每一个脚本对应一个部署 task，添加新合约，需要添加对应的 migration 脚本
2. 所有 truffle 项目都会自带一个 Migration 合约，用于存储当前项目上次部署的位置: `last_completed_migration`, `setCompleted()`
3. cfxtruffle deploy 执行时会查询上次的部署位置，并从下一个任务开始执行，执行完成之后也会更新当次部署序号。

另外 cfxtruffle deploy 有几个参数(--reset, --from, --to)可以控制 migration 的执行规则，具体可参看 cfxtruffle help

#### 合约交互

cfxtruffle 也提供了命令行式的交互环境，在该环境中可以直接获取或更新合约的状态。

```sh
$ cfxtruffle console  # 在项目目录下执行，开启交互模式
# 初始合约实例
truffle(develop)> let instance = await MetaCoin.deployed()
truffle(develop)> instance
# 获取余额
truffle(develop)> let balance = await instance.getBalance(accounts[0])
truffle(develop)> balance.toNumber()
# 转账
truffle(develop)> let result = await instance.sendCoin(accounts[1], 10, {from: accounts[0]})
truffle(develop)> result
```

#### 合约测试

cfxtruffle 默认集成了 Mocha 和 chai 测试框架，可通过 test 子命令运行。

单元测试代码示例：
```js
const MetaCoin = artifacts.require("MetaCoin");

contract('MetaCoin', (accounts) => {
  it('should put 10000 MetaCoin in the first account', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const balance = await metaCoinInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
}
```

执行测试：
```sh
$ cfxtruffle test
```

## 未支持的功能

目前 cfxtruffle 迁移还在不断进行中，以下命令还无法支持 conflux

* develop


## 总结
cfxtruffle 可以大大减少智能合约开发工作量，目前核心功能（编译，部署，交互，测试）已完成兼容改造，其余 feature 也会持续迁移从而进行支持。

