const path = require('path')

module.exports = {
  entry: './src/OnSched.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js'
  }
}
