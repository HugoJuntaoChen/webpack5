const { SyncHook } = require('tapable');

// 初始化同步钩子
const hook = new SyncHook();

// 注册事件
hook.tap('event 1', (arg1, arg2, arg3) => {
    console.log('event 1:', arg1, arg2, arg3)
})
hook.tap('event 2', (arg1, arg2, arg3) => {
    console.log('event 2:', arg1, arg2, arg3)
})
hook.call('1', '2', '3');
// event 1: undefined undefined undefined
// event 2: undefined undefined undefined

// 初始化同步钩子
const hook1 = new SyncHook(["arg1", "arg2"]);

// 注册事件
hook1.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3)
})
hook1.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3)
})

hook1.call('1', '2', '3')
// flag 2: 1 2 undefined
// flag 1: 1 2 undefined

