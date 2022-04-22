const { SyncBailHook } = require('tapable');

const hook = new SyncBailHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3);
    // 存在返回值 阻断flag2事件的调用
    return true
});

hook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
});

hook.call('19Qingfeng', 'wang', 'haoyu');
// 打印结果
// flag1: 19Qingfeng wang haoyu
