#prototype 对象

#### 一：实例函数对象

> 1、实例函数对象的原型(__proto__) >>>> 构造函数对象的prototype属性 // cat.__proto__ === Animal.prototype

> 2、构造函数对象的prototype属性的原型(__proto__) >>>> Object的prototype属性 // Animal.prototype.__proto__ === Object.prototype

> 3、Object的prototype属性的原型(__proto__) >>>> null // console.log(Object.prototype.__proto__ === null); // true

```javascript
function Animal (name) {
  this.name = name;
}

var cat = new Animal('大毛');

// 1、实例函数对象的原型(__proto__)等于构造函数对象的prototype属性
console.log(cat.__proto__ === Animal.prototype); // true

// 2、构造函数对象的prototype属性的原型(__proto__)等于Object的prototype属性
console.log(Animal.prototype.__proto__ === Object.prototype); // true

// 3、Object的prototype属性的原型(__proto__)等于null
console.log(Object.prototype.__proto__ === null); // true

```

#### 二：构造函数对象

> 1、构造函数对象的原型(__proto__) >>>> Function对象的prototype属性 // Animal.__proto__ === Function.prototype

> 2、构造函数对象的prototype属性的原型(__proto__) >>>> Object的prototype属性 // Function.prototype.__proto__ === Object.prototype

> 3、Object的prototype属性的原型(__proto__) >>>> null // console.log(Object.prototype.__proto__ === null); // true

```javascript
function Animal (name) {
  this.name = name;
}

// 1、构造函数对象的原型(__proto__)等于Function对象的prototype属性，也就是匿名函数，
console.log(Animal.__proto__ === Function.prototype); // true

// Object、Function、Array等同样适用
console.log(Object.__proto__ === Function.prototype); // 匿名函数
console.log(Function.__proto__ === Function.prototype); // 匿名函数
console.log(Function.__proto__ === Function.prototype); // 匿名函数
// 2、Function对象的prototype属性的原型(__proto__)等于Object的prototype属性
console.log(Function.prototype.__proto__ === Object.prototype); // true

// 3、Object的prototype属性的原型(__proto__)等于null
console.log(Object.prototype.__proto__ === null); // true

```