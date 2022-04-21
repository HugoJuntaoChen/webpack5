class DonePlugin1 {
    apply(compiler) {
        // 调用 Compiler Hook 注册额外逻辑
        compiler.hooks.done.tap('Plugin Done', () => {
            console.log('compilation done 1');
        });
    }
}

module.exports = DonePlugin1;
