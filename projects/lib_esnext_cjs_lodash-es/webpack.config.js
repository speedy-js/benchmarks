const path = require('path');
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.resolve(__dirname, '../../fixtures/lodash-es/lodash.js'),
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack.js',
    library: {
      type: 'commonjs2',
    }
  },
  optimization: {
    minimize: false,
  },
};
