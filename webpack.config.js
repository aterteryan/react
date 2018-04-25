const path = require('path');

const config = {
  entry: ['babel-polyfill', 'renderers/dom.js'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  resolve: {
    modules: [
      path.resolve('./lib'),
      path.resolve('./node_modules')
    ]
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/, 
        use: ['babel-loader', 'eslint-loader']
      }
    ]
  }
}

module.exports = config;