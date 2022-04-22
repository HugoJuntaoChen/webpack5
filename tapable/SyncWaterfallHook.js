const { SyncWaterfallHook } = require('tapable');

// 初始化同步钩子
const hook = new SyncWaterfallHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1:', arg1, arg2, arg3);
    // 存在返回值 修改flag2函数的实参
    return 'github';
});

hook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
});

hook.tap('flag3', (arg1, arg2, arg3) => {
    console.log('flag3:', arg1, arg2, arg3);
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 输出结果
// flag1: 19Qingfeng wang haoyu
// flag2: github wang haoyu
// flag3: github wang haoyu

//需要额外注意的是当存在多个参数时，通过 SyncWaterfallHook 仅能修改第一个参数的返回值。