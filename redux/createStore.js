import isPlain from 'lodash/isPlainObject';
import $$observable from 'symbol-observable'

/**
 * 首先定义了一个action类型，我们知道更新state的唯一方法就是dispatch一个action，这个action是用来初始化state的，后面会用到它
 */
export const ActionTypes = {
    INIT: '@@redux/INIT'
}

/**
* 接收三个参数
* @param {Function} reducer：reducer是唯一必传的参数，它很重要，因为它决定了整个state。当dispatch一个action时，此函数接收action来更新state
* @param {any} [preloadedState]: 初始State
* @param {Function} [enhancer]: 中间件，用来增强store, Redux 定义有applyMiddleware来增强store，后面会单独讲applyMiddleware
* @returns {Store}
*/
export default function createStore(reducer, preloadedState, enhancer) {
    
    // 如果只传了两个参数，并且第二个参数为函数，第二个参数会被当作enhancer
    if(typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    if(typeof enhancer !== 'undefined') {
        // 校验enhancer是否为函数，如果不是函数则抛出异常
        if(typeof enhancer !== 'function') {
            throw new Error('enhancer 必须是一个函数');
        }
        // 如果enhancer存在且为函数，那么则返回如下调用: 假设enhancer为applyMiddleware，那么调用则是applyMiddleware(createStore)(reducer, preloadedState)。后面讲applyMiddleware再详细讲。
        return enhancer(createStore)(reducer, preloadedState);
    }

    // 校验reducer是否为函数，如果不是函数则抛出异常
    if (typeof reducer !== 'function') {
        throw new Error('reducer 必须是一个函数');
    }

    // 当前的reducer
    let currentReducer = reducer;

    // 当前的state，没有传递则为undefined
    let currentState = preloadedState;

    // 定义一个数组用来存放listeners。就是一个函数数组，当state发生改变时，会循环执行这个数组里面的函数
    let currentListeners = [];

    // nextListeners的存在是为了避免在listeners执行过程中，listeners发生改变，导致错误。listeners的添加或删除都是对nextListeners进行操作的。
    let nextListeners = currentListeners;

    // reducer函数是否正在执行的标识
    let isDispatching = false;

    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            // 保证nextListeners的修改不会影响currentListeners。
            nextListeners = currentListeners.slice();
        }
    }

    // 获取store中的state，在没有dispatch正在执行的情况下，直接返回前面说很重要的currentState
    function getState() {
        return currentState;
    }

    // 接收一个函数参数，订阅state的改变。当state改变时会执行这个函数
    function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('listener 必须是一个函数')
        }

        let isSubscribed = true

        ensureCanMutateNextListeners();
        nextListeners.push(listener)

        return function unsubscribe() {
            if (!isSubscribed) {
                return
            }

            isSubscribed = false

            ensureCanMutateNextListeners()
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
        }
    }

    // 它只接收一个参数action，action必须是简单对象，而且必须有type属性。触发action去执行reducer，更新state
    function dispatch(action) {
        if (!isPlainObject(action)) {
            throw new Error(
                'Actions must be plain objects. ' +
                'Use custom middleware for async actions.'
            )
        }

        if (typeof action.type === 'undefined') {
            throw new Error(
                'Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?'
            )
        }

        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions.')
        }

        try {
            isDispatching = true;
            // 用来调用reducer，并将执行的结果赋给currentState。这样currentState中的数据就总是最新的，即reducer处理完action之后返回的数据。没有条件，执行dispatch后reducer总会执行。
            currentState = currentReducer(currentState, action);
        } finally {
            isDispatching = false;
        }
        
        // 用来调用subscribe传进来的listeners，按顺序执行它们，没有任何条件判断，也就是说只要执行dispatch，所有的listeners都会执行，不管state有没有发生改变，而且listeners执行的时候是没参数的。
        const listeners = currentListeners = nextListeners;
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }

        return action;
    }

    // 替换reducer
    function replaceReducer(nextReducer) {
        if (typeof nextReducer !== 'function') {
            throw new Error('Expected the nextReducer to be a function.')
        }
        // 直接拿nextReducer替换掉前面说很重要的currentReducer，后面再执行dispatch，action就会被nextReducer处理，处理的结果赋值给currentState。替换之后会执行一遍初始化action。
        currentReducer = nextReducer
        dispatch({ type: ActionTypes.INIT })
    }

    function observable() {
        const outerSubscribe = subscribe
        return {
            subscribe(observer) {
            if (typeof observer !== 'object') {
                throw new TypeError('Expected the observer to be an object.')
            }

            function observeState() {
                if (observer.next) {
                observer.next(getState())
                }
            }

            observeState()
            const unsubscribe = outerSubscribe(observeState)
                return { unsubscribe }
            },

            [$$observable]() {
                return this
            }
        }
    }

    // reducer和listeners在store创建的时候都会被执行一遍，listeners没有什么特别要关注的。reducer执行必须关注，因为它的执行结果影响你的数据。比如createStore的时候你没有传入preloadedState，在reducer内的state有默认参数，正常情况下你的reducer会使用default分支处理这个action，而且一般default分支会直接返回state，所以这种情况下store创建完后，使用getState()获取的值就是默认参数组成的state
    dispatch({ type: ActionTypes.INIT })
    
    // 返回值
    return {
        dispatch, // 触发action去执行reducer，更新state
        subscribe, // 订阅state改变，state改变时会执行subscribe的参数（自定义的一个函数）
        getState, // 获取state
        replaceReducer, // 替换reducer
        [$$observable]: observable
    }
}