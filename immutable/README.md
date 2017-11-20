# Immutable详细解析

## 相关推荐

[基于react + redux + immutable + less + ES6/7 + webpack2.0 + fetch + react-router + antd(1.x)实现的SPA后台管理系统模板](https://github.com/sosout/react-antd)

## 关于我自己

>  JS/React/Vue/Angular前端群： 599399742

>  邮&emsp;&emsp;&ensp;箱： sosout@139.com

>  个人网站： http://www.sosout.com/

>  个人博客： http://blog.sosout.com/

>  个人简书： http://www.jianshu.com/users/23b9a23b8849/latest_articles

>  segmentfault：https://segmentfault.com/u/sosout

## 引言
Shared mutable state is the root of all evil（共享的可变状态是万恶之源）！ -- Pete Hunt

有人说 Immutable 可以给 React 应用带来数十倍的提升，也有人说 Immutable 的引入是近期 JavaScript 中伟大的发明，因为同期 React 太火，它的光芒被掩盖了。这些至少说明 Immutable 是很有价值的，下面我们来一探究竟。

JavaScript 中的对象一般是可变的（Mutable），因为使用了引用赋值，新的对象简单的引用了原始对象，改变新的对象将影响到原始对象。如 foo={a: 1}; bar=foo; bar.a=2 你会发现此时 foo.a 也被改成了 2。虽然这样做可以节约内存，但当应用复杂后，这就造成了非常大的隐患，Mutable 带来的优点变得得不偿失。为了解决这个问题，一般的做法是使用 shallowCopy（浅拷贝）或 deepCopy（深拷贝）来避免被修改，但这样做造成了 CPU 和内存的浪费。

Immutable 可以很好地解决这些问题。

## Immutable Data 是什么？

Immutable Data 就是一旦创建，就不能再被更改的数据。对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象。Immutable 实现的原理是 Persistent Data Structure（持久化数据结构），也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变。同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗，Immutable 使用了 Structural Sharing（结构共享），即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。请看下面动画：