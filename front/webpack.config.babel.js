const path = require('path');

module.exports = {
  entry: './main.js',
  output: {
    path: 'static',
    filename: 'built.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }],
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
    },
  },
};
