class DonePlugin1 {
    apply(compiler) {
        // 调用 Compiler Hook 注册额外逻辑
        compiler.hooks.done.tapAsync('Plugin Done', (stats, cb) => {
            console.log('compilation done 1', stats.hash);
            cb();
        });
    }
}

module.exports = DonePlugin1;
