const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const { cssLoaderConfig,
        imageLoaderConfig,
        fontLoaderConfig } = require('./webpack.loaders')

module.exports = {
  mode: 'development',
  entry: './src/OnSched.js',
  plugins: [
    new CleanWebpackPlugin(),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'this',
  },
  performance: { maxAssetSize: 500000 },
  module: {
    rules: [
      cssLoaderConfig(),
      imageLoaderConfig(),
      fontLoaderConfig()
    ]
  }
}
