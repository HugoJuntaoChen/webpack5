class PluginA {
    apply(compiler) {
        // 
        compiler.hooks.run.tap('Plugin A', () => {
            //
            console.log('PluginA');
        });
    }
}

module.exports = PluginA;