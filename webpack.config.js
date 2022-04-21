const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const DonePlugin = require('./webpack/plugins/donePlugin')
const DonePlugin1 = require('./webpack/plugins/donePlugin1')
const PluginA = require('./webpack/plugins/pluginA')
const PluginB = require('./webpack/plugins/pluginB')

module.exports = {
    // mode: 'development',
    mode: 'production',
    // devtool: 'source-map',
    // 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
    // 换而言之entry和loader的所有相对路径都是相对于这个路径而言的
    context: process.cwd(),
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist1'),
        filename: '[name].js'
    },
    devServer: {
        port: 8888,
        contentBase: path.resolve(__dirname, 'src/index')
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.js/,
                use: [
                    path.resolve(__dirname, 'webpack/loader/loader1.js'),
                    path.resolve(__dirname, 'webpack/loader/loader2.js')
                ]
            }
        ],
    },
    plugins: [
        // new HtmlWebpackPlugin(),
        new DonePlugin1(),
        new DonePlugin(),
        new PluginA(),
        new PluginB()
    ]
}