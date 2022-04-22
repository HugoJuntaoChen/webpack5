const { AsyncParallelHook } = require('tapable');

const hook = new AsyncParallelHook(['arg1', 'arg2', 'arg3']);
console.time('timer');

hook.tapPromise('flag1', (arg1, arg2, arg3) => {
    console.log('flag2:', arg1, arg2, arg3);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
});

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
    console.log('flag1:', arg1, arg2, arg3);
    setTimeout(() => {
        callback();
    }, 1000);
});

hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
    console.log('all done');
    console.timeEnd('timer');
});
// flag2: 19Qingfeng wang haoyu
// flag1: 19Qingfeng wang haoyu
// all done
// timer: 1.010s
