const babelLoaderConfig = () => {
  return {
    test: /\.(m?js|jsx)$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        plugins: ["@babel/plugin-transform-runtime"],
      }
    }
  }
}

const cssLoaderConfig = () => {
  return {
    test: /\.css$/i,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' }
    ],
  }
}

const fontLoaderConfig = () => {
  return {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    use: [
      'file-loader',
    ],
  }
}

const imageLoaderConfig = () => {
  return {
    test: /\.(png|svg|jpg|gif)$/,
    use: [
      'file-loader',
    ],
  }
}


module.exports = {
  babelLoaderConfig,
  cssLoaderConfig,
  fontLoaderConfig,
  imageLoaderConfig
}
