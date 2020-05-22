const path                   = require('path')
const { DefinePlugin }       = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const { babelLoaderConfig,
        cssLoaderConfig,
        fontLoaderConfig,
        imageLoaderConfig} = require('./webpack.loaders')

module.exports = {
  mode: 'production',
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/OnSched.js'
  ],
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(require("./package.json").version)
    }),
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
      babelLoaderConfig(),
      cssLoaderConfig(),
      imageLoaderConfig(),
      fontLoaderConfig()
    ]
  }
}
