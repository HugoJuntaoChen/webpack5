const webpack = require('./webpack');
const config = require('../../webpack.config');

// webpack()方法会返回一个compiler对象
const compiler = webpack(config);
// 调用run方法进行打包
compiler.run((err, stats) => {
    if (err) {
        console.log(err, 'err');
    }
});

