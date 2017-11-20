# Vue源码分析

## Vue.use源码分析

我相信有过vue开发经验的大佬们，对于vue.use并不陌生。当使用vue-resource或vue-router等全局组件时，必须通过Vue.use方法引入，才起作用。那么我们来看看这个方法：

```javascript
Vue.use = function (plugin) {
    if (plugin.installed) {
      return // 假如插件已经初始化过就不再继续。避免插件重复引入
    }
    // additional parameters
    var args = toArray(arguments, 1); // 获取插件的配置参数
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args); // 调用的是插件的install方法；
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args); // 若插件本省就是一个函数。则直接调用该函数
    }
    plugin.installed = true;
    return this
};
```

假设我们通过Vue.use引入一个插件plugin(该插件可以暂时理解为一个变量或参数)，即Vue.use(plugin);首先判断传入的参数plugin的属性installed是否存在，如果存在且逻辑值为真，那么直接返回，后边的代码就不会在执行，这个判断的作用是什么呢？后边会讲到。

我们先假设plugin的属性installed不存在或为假，那么继续往下执行

```javascript
/**
 * 执行了一个toArray方法，toArray接收了两个参数，arguments为Vue.use方法传入的参数集合，例如Vue.use(a,b, * c),那么arguments类似于[a,b,c]（说明：arguments只是类数组，并不是真正的数组）
 * 此处因为我们只引入一个参数plugin，所以arguments类似于[plugin]。
*/
var args = toArray(arguments, 1);
```

toArray的作用是什么呢？看源码。

```javascript
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}
```

当执行toArray(arguments,1)，会生成一个新数组ret，长度 = arguments.length-1，然后进行while循环，依次倒序把arguments的元素赋值给ret,因为ret比arguments长度少1，所以最终等同于arguments把除了第一个元素外的其余元素赋值给ret。toArray主要作用就是把类数组转化为真正的数组，这样才能调用数组的方法。因为此处我只引入一个plugin参数，即arguments=[plugin]，所以toArray返回为空数组[]。

接着往下执行，args.unshift(this)，等同于[].unshift(Vue),即args = [Vue];

然后执行:
```javascript
if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args);
} else if (typeof plugin === 'function') {
    plugin.apply(null, args);
}
```

此处判断plugin的install是否为函数，如果为函数，立即执行pluign.install方法，install方法传入的参数为args内数组元素，即install接受的第一个参数为Vue.

如果plugin的install不是函数，那么判断plugin本身是否为函数，如果为函数，那么执行plugin函数，且参数为args内数组元素。

最后设置plugin.installed为true。设置plugin.installed为true的作用是避免同一个插件多次执行安装，比如Vue.use(plugin)执行一次之后，installed为true,再次执行的话走到第一步判断就返回了。

综上所述，Vue.use的作用其实就是执行一个plugin函数或者执行pluign的install方法进行插件注册，并且向plugin或其install方法传入Vue对象作为第一个参数，use的其他参数作为plugin或install的其他参数。

```javascript
import Vue from 'vue'

function test(a) {
   console.log(a); // Vue
}

function test1(a, b) {
　　console.log(a, b); // Vue hello
}

let oTest = {
   install：function(a, b) {
      console.log(a, b); // Vue hello1
   }
}

Vue.use(test);

Vue.use(test1, 'hello');
Vue.use(oTest, 'hello1')
console.log(oTest);
{
　　install: function() {...},
　　installed: true
}
```