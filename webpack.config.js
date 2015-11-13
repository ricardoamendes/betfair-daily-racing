var path = require('path');

module.exports = {
  entry: './app/scripts/main.js',
  output: {
    filename: 'bundle.js'
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
