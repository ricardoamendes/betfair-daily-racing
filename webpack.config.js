var path = require('path');
var envs = require('gulp-environments');

module.exports = {
    entry: './app/scripts/main.js',
    output: {
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            config: path.join(__dirname, 'app/config', envs.production() ? 'production' : 'development')
        }
    },
    module: {
        loaders: [{
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.js$/,
            exclude: [
                path.join(__dirname, 'node_modules')
            ],
            loader: 'babel-loader'
        }]
    }
};
