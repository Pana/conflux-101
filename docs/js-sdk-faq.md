JS-SDK faqs
===

##### 主网，测试网的 RPC 是多少

1. mainnet: http://main.confluxrpc.org
2. testnet: http://test.confluxrpc.org

##### 主网，测试网的 chainId 是多少

1. mainnet: 1029
2. testnet: 1

##### Conflux 的原生代币是什么，精度是多少
1. Conflux 的原生代币是 CFX，精度 18 位, 最小单位为 Drip
2. 转账金额，以及手续费的费用（gasPrice）均使用 Drip 作为单位
3. js-sdk 提供了 [Drip](https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/docs/api.md#Drip.js/Drip/(static)fromCFX) 类，方便不同单位的转换。

##### 如何获取测试网代币
1. Portal 钱包的存入按钮内，有领取测试网代币的按钮
2. 或者使用申领的地址替换下面url中的`your-address` 并在浏览器中访问，即可获取（每小时100CFX）
http://test-faucet.conflux-chain.org:18088/dev/ask?address=${your-address}


##### 发送交易时 storageLimit 是什么
当你发送一笔交易时，不仅会消耗节点的计算资源（gas）还会占用节点的存储资源，计算资源的使用需要给矿工付一些手续费，
也就是 gas 费用，占用的存储资源是可以释放的，因此是不需要付费的，但是在占用期间需要抵押相应的 CFX，以保证用户用完后释放占用的存储资源。
storageLimit 是用来指定一笔交易可以占用的存储空间的上限，其单位为字节B。


##### 发送交易时 `nonce` 是什么 ?
nonce 是用来保证一个用户交易顺序的机制，一个账户的 nonce 从 0 开始，每发送一笔交易就加一。交易的执行也只能按照 nonce 的顺序依次执行不能跳跃。
因此 nonce 并不是一个随机数，发送交易时需要首先正确获取用户当前的 nonce。
并且 nonce 在链上状态的更新也是 one by one 的，因此当你需要批量发送交易的时候需要手动管理 nonce 的状态。

##### 为什么交易发送失败?
交易发送失败的原因有多种：

1. 使用了已经用过的 nonce
2. 交易的参数没有填对比如：chainId，epochHeight 等
3. 签名错误

##### 为什么交易发送了一直不打包?
交易一直不打包有如下几种情况：

1. `from` 的 balance 不够
2. `nonce` 使用不对，跳过了一些未使用的 nonce

##### 为什么交易发送成功了，但执行失败?
交易执行失败的原因很多，交易的 receipt 中有一个信息 `txExecErrorMsg` 中存储了交易失败的具体原因