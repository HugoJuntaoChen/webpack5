const { AsyncSeriesHook } = require('tapable');
// 初始化同步钩子
const hook = new AsyncSeriesHook(['arg1', 'arg2', 'arg3']);
console.time('timer');
// 注册事件
hook.tapAsync('flag1', (arg1, arg2, arg3, callback) => {
    console.log('flag1:', arg1, arg2, arg3);
    setTimeout(() => {
        // 1s后调用callback表示 flag1执行完成
        callback(1);
    }, 1000);
});
hook.tapPromise('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
    // tapPromise返回Promise
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
});
// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', (err) => {
    console.log(err);
    console.log('全部执行完毕 done');
    console.timeEnd('timer');
});
// 打印结果
// flag1: 19Qingfeng wang haoyu
// flag2: 19Qingfeng wang haoyu
// 全部执行完毕 done
// timer: 2.012s
