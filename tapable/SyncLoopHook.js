const { SyncLoopHook } = require('tapable');

let flag1 = 2;
let flag2 = 1;

// 初始化同步钩子
const hook = new SyncLoopHook(['arg1', 'arg2', 'arg3']);

hook.tap('flag1', (arg1, arg2, arg3) => {
    console.log('flag1');
    if (flag1 !== 3) {
        return flag1++;
    }
});

hook.tap('flag2', (arg1, arg2, arg3) => {
    console.log('flag2');
    if (flag2 !== 3) {
        return flag2++;
    }
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 执行结果
// flag1
// flag1
// flag2
// flag1
// flag2
// flag1
// flag2
