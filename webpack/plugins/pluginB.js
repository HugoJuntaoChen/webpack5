class PluginB {
    apply(compiler) {
        // 注册同步钩子
        // 这里的compiler对象就是我们new Compiler()创建的实例哦
        compiler.hooks.run.tap('Plugin B', () => {
            // 调用
            console.log('PluginB');
        });
    }
}

module.exports = PluginB;
