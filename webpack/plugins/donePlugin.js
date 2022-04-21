class DonePlugin {
    apply(compiler) {
        // 调用 Compiler Hook 注册额外逻辑
        compiler.hooks.done.tap('Plugin Done', () => {
            console.log('compilation done ');
        });
    }
}

module.exports = DonePlugin;
