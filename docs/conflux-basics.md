conflux-basics
===

* consensus protocol
* authenticated storage
* transaction relay protocol

### 账本结构
Conflux 的账本结构跟比特币区别很大，众所周知比特币是链式账本， Conflux 的账本则属于 DAG (有向无环图)。
之所以使用 DAG 是因为比特币中前后两个区块的交易并非都是有关的，所以这些交易是可以并发执行。
在 Conflux 中对 DAG 进行了微创新即 TreeGraph(树图)。
之所以叫做树图，是因为在账本结构中的引用（边）有两种：实边，虚边。

1. conflux 网络中每个区块会有多个对其他区块的引用。
2. 其中只有一个引用是父引用（实边）。
3. 有多个普通引用（虚边）。

整个账本如果只看实边是一个 Tree，如果把虚边也算进来则是一个 DAG。
虚边的作用是帮助账本中的区块确定全序。

![](https://developer.conflux-chain.org/img/tree_graph.jpg)


### 共识算法 Greedy-Heaviest-Adaptive-SubTree (GHAST)
1. 通过最重子树的方式确定实边
2. 由所有的实边确定一个 pivot chain
3. 根据 pivot chain 和虚边确定所有 block 的顺序


### Epoch vs Block number
在 conflux 没有 block number 的概念，与之对应的是 epoch 的概念，但在 conflux 中一个 epoch 中可能会有多个 block。
一个 epoch 中的所有 block 有各自的 index， pivot block 的 index 不一定是 0。


### 智能合约代付费机制

### 经济模型

1. 初始阶段，Conflux 的创世通证总量为 50 亿

### TPS

1. 平均 0.5s 一个 block
2. 上万节点 TPS 可以做到 3000 以上