var path = require('path');

module.exports = {
    entry: './main.js',
    target: 'node',
    output: {
        filename: 'server.js'
    },
    resolve: {
        alias: {
            config: path.join(__dirname, 'scripts', 'config')
        }
    },
    module: {
        loaders: [{
            test: /\.json$/,
            loader: "json-loader"
        }, {
            test: /\.js$/,
            exclude: [
                path.join(__dirname, "node_modules")
            ],
            loader: 'babel-loader'
        }]
    }
};
