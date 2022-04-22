class PluginB {
    apply(compiler) {
        compiler.hooks.run.tap('Plugin B', () => {
            console.log('PluginB');
        });
    }
}
module.exports = PluginB;
