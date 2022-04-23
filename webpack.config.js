const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const CustomPlugin = require('./webpack/plugins/CustomPlugin')

module.exports = {
    // mode: 'development',
    mode: 'production',
    context: process.cwd(),
    entry: {
        entry1: './src/index.js',
        entry2: './src/index2.js'
    },
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
        new CustomPlugin(),
    ]
}