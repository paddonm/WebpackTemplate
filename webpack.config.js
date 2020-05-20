const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const { cssLoaderConfig,
        imageLoaderConfig,
        fontLoaderConfig } = require('./webpack.loaders')

module.exports = {
  mode: 'development',
  entry: './src/OnSched.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js',
    libraryTarget: 'this',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 5000,
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
      cssLoaderConfig(),
      imageLoaderConfig(),
      fontLoaderConfig()
    ]
  },


}
