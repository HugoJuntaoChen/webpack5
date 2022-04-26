const webpack = require('./webpack');
const config = require('../../webpack.config');

const compiler = webpack(config);
if (config.watch) {
    // webpack will watch entries and dependency changes and will rebuild the compilation whenever they change
} else {
    // start build
    compiler.run((err, stats) => {
        if (err) {
            console.log('err', err);
        }
        console.log('stats', stats);
    });
}

