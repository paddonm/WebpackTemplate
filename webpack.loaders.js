const cssLoaderConfig = () => {
  return {
    test: /\.css$/i,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' }
    ],
  }
}

const imageLoaderConfig =  () => {
  return {
    test: /\.(png|svg|jpg|gif)$/,
    use: [
      'file-loader',
    ],
  }
}

const fontLoaderConfig =  () => {
  return {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    use: [
      'file-loader',
    ],
  }
}
module.exports = {
  cssLoaderConfig,
  imageLoaderConfig,
  fontLoaderConfig
}
