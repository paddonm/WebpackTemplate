const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const { babelLoaderConfig,
        cssLoaderConfig,
        fontLoaderConfig,
        imageLoaderConfig } = require('./webpack.loaders')

module.exports = {
  mode: 'development',
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/OnSched.js'
  ],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js',
    libraryTarget: 'this',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 5000,
    compress: true,
    publicPath: '/',
    contentBase: path.join(__dirname, 'public')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  ],
  performance: { maxAssetSize: 500000 },
  module: {
    rules: [
      babelLoaderConfig(),
      cssLoaderConfig(),
      imageLoaderConfig(),
      fontLoaderConfig()
    ]
  },


}
