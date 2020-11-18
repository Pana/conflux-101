

### 主节点部署
1. public-address 是否必须一个公网IP?

2. conflux 节点运行的时候 epoch 会不间断停止增长

3. conflux account new 之后运行中的节点不会重新加载新添加的keystore 0.6.0版本

4. cfx_sendTransaction password 的问题


### 合约开发相关问题

1. 合约部署 estimate gas 失败


2. 部署完的合约一直确认中? 这种情况一般就是长期在交易池中，没有被选择打包
    storageLimit 没设置
    nonce 跳跃设置
    gas 设置的不够


3. sponsor contract invalid address
    当时测试网友此问题，后来版本正常


#### 安装挖矿算法，导致conflux-rust 编译失败
jsoncpp, boost, cmake, xxopts cuda 等