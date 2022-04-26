const { AsyncSeriesHook } = require('tapable');

const hook = new AsyncSeriesHook(['arg1', 'arg2', 'arg3']);
console.time('timer');

hook.tapAsync('flag1', (arg1, arg2, arg3, callback) => {
    console.log('flag1:', arg1, arg2, arg3);
    setTimeout(() => {
        callback(1);
    }, 1000);
});
hook.tapPromise('flag2', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 500);
    });
});
// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', (err) => {
    console.log(err);
    console.log('all done');
    console.timeEnd('timer');
});
// flag1: 19Qingfeng wang haoyu
// 1
// all done
// timer: 1.012s
