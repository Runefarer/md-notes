import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const cwd = dirname(fileURLToPath(import.meta.url));

const config = {
  entry: {
    index: path.resolve(cwd, 'src', 'index.jsx'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(cwd, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(?:jsx?)$/,
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(cwd, 'public', 'index.html'),
    }),
  ],
  devServer: {
    contentBase: path.resolve(cwd, 'dist'),
    compress: true,
    port: 8000,
  },
  watch: true,
};

export { config as default };
