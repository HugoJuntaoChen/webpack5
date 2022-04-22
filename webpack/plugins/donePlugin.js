class DonePlugin {
    apply(compiler) {
        // tap
        compiler.hooks.done.tap('Plugin Done', () => {
            console.log('compilation done ');
        });
    }
}

module.exports = DonePlugin;
