Conflux 代付费
===
在 bitcoin 中发送交易需要付手续费，在以太坊中转账和调用合约同样需要手续费，这个是对用户体验的一大伤害。

现在的解决办法：
1. 给用户空投代币（羊毛党问题）
2. 报销交易费（使用成本仍然很高）
3. 合约钱包：Argent，Mykey（EOS）


### Conflux
Conflux 提供了代付费机制：智能合约可以允许其他账户提供赞助，这样即使一个余额为 0 的用户，也可以进行智能合约的交互，
其交易的打包费用由赞助者来支付。

在 Conflux 里，每个智能合约的（关于交易费的）赞助情况可以由如下几个参数描述：

* 赞助者（Sponsor）：记录提供了当前赞助金的提供者；
* 赞助金余额（Sponsor balance）：记录了当前赞助金的余额；
* 单笔交易资助金额上限（Sponsor limit per transaction）：这是赞助者愿意为每笔交易提供的资助上限；
* 用户白名单（Whitelist）：这个名单记录了合约愿意资助的账户列表，也可以设置为资助所有账户。

任何人只要转账给合约，并设置 Sponsor limit per transaction 即可成为 sponsor，而白名单则是由智能合约设置的。

赞助者和赞助金的管理采用了比较开放的方式：任何人只要肯出钱就可以成为新的赞助者。用户可以向任何合约捐一笔赞助金并声明愿为每笔交易提供的资助上限，只要捐的钱超过该合约当前的赞助金余额且单笔交易资助上限不减少，则合约的赞助者就会被替换成新的金主——之前的赞助金余额会被原路退回给上一个赞助者。单笔交易资助金额的上限只有在当前资助金余额已经小于单笔交易资助上限的情况才可以减少。


### 问题

1. 具体如何成为一个赞助者：如何设置 Sponsor limit per transaction ？
2. 智能合约的交互大多应该是需要进行转账的，这种方式仍然无法解决余额为 0 的问题？
    所以此机制主要解决的不是余额为 0 的问题，而是普通用户不希望自己付交易费的问题。
3. 赞助金用完了，重新转账即可继续赞助？
4. 如何给智能合约设置白名单?


### 参考

* [Conflux 研究院 | 详解 Conflux 代付费机制](https://mp.weixin.qq.com/s/dm318fvjTXj6_xJ1uFdk-w)
* [Official SponsorControl contract doc](https://developer.conflux-chain.org/docs/conflux-rust/internal_contract/internal_contract/#sponsorship-for-usage-of-contracts)