const Compiler = require('./compiler');

function webpack(options) {
    // mergeOptions
    const mergeOptions = _mergeOptions(options);

    const compiler = new Compiler(mergeOptions)

    loadCustomPlugin(options.plugins, compiler);
    return compiler
}

function _mergeOptions(options) {
    const shellOptions = process.argv.slice(2).reduce((option, argv) => {
        // argv -> --mode=production
        const [key, value] = argv.split('=');
        if (key && value) {
            option[key] = value;
        }
        return option;
    }, {});
    const finalOptions = { ...options, ...shellOptions };
    return finalOptions;
}

function loadCustomPlugin(plugins, compiler) {
    if (plugins && Array.isArray(plugins)) {
        plugins.forEach((plugin) => {
            plugin.apply(compiler);
        });
    }
}


module.exports = webpack;
