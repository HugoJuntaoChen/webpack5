const { SyncHook } = require('tapable');

const syncHook = new SyncHook(['arg1', 'arg2']);

syncHook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1', arg1, arg2, arg3);
})
syncHook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2', arg1, arg2, arg3);
})
syncHook.call(1, 2, 3);
// flag1 1 2 undefined
// flag2 1 2 undefined
