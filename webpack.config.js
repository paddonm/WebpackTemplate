const path                   = require('path')
const HtmlWebpackPlugin      = require('html-webpack-plugin')
const { DefinePlugin }       = require('webpack')
const { SourceMapDevToolPlugin }       = require('webpack')
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
    './src/PetesPier.js'
  ],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js',
    sourceMapFilename: 'index.js.map',
    libraryTarget: 'this',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 5000,
    https: true,
    compress: true,
    publicPath: '/',
    contentBase: path.join(__dirname, 'public')
  },
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(require("./package.json").version)
    }),
    new CleanWebpackPlugin(),
    new SourceMapDevToolPlugin({
      filename: 'index.js.map',
      exclude:  ['node_modules'],
      module:    true,
      columns:   true,
      noSources: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  ],
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize:      1500000
  },
  module: {
    rules: [
      babelLoaderConfig(),
      cssLoaderConfig(),
      imageLoaderConfig(),
      fontLoaderConfig()
    ]
  },
}
