const Compiler = require('./compiler');
// 实现webpack
function webpack(options) {
    // 合并参数 得到合并后的参数 mergeOptions
    const mergeOptions = _mergeOptions(options);
    // 创建compiler对象
    const compiler = new Compiler(mergeOptions)
    // 注册plugins
    _loadPlugin(options.plugins, compiler);
    return compiler
}
// 合并参数
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

// 加载插件函数
function _loadPlugin(plugins, compiler) {
    if (plugins && Array.isArray(plugins)) {
        plugins.forEach((plugin) => {
            plugin.apply(compiler);
        });
    }
}


module.exports = webpack;
