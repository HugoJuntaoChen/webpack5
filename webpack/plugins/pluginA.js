class PluginA {
    apply(compiler) {
        // 注册同步钩子
        // 这里的compiler对象就是我们new Compiler()创建的实例哦
        compiler.hooks.run.tap('Plugin A', () => {
            // 调用
            console.log('PluginA');
        });
    }
}

module.exports = PluginA;