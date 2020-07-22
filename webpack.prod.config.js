const path                       = require('path')
const { DefinePlugin,
        SourceMapDevToolPlugin } = require('webpack')
const { CleanWebpackPlugin }     = require('clean-webpack-plugin')
const SentryWebpackPlugin        = require('@sentry/webpack-plugin')

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
  // devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(require("./package.json").version)
    }),
    new CleanWebpackPlugin(),
    new SentryWebpackPlugin({
      release: require('./package.json').version,
      include: path.resolve(__dirname, 'dist'),
      ignore: ['node_modules', 'webpack.*.js'],
      ignoreFile: '.gitignore',
    }),
    new SourceMapDevToolPlugin({
      filename: 'index.js.map',
      exclude:  ['node_modules'],
      module:    true,
      columns:   true,
      noSources: false,
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'this',
    // sourceMapFilename: "index.js.map"
  },
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
