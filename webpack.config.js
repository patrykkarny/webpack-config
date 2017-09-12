const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fs = require('fs');
const ini = require('ini');

if (fs.existsSync('.env')) {
  const env = ini.decode(fs.readFileSync('.env', {
    encoding: 'utf8'
  }));
  for (const key of Object.keys(env)) {
    process.env[key] = env[key];
  }
}

const DEBUG = process.env.npm_lifecycle_event !== 'build';

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: './index.ts',
    vendor: './vendor.ts'
  },
  output: {
    filename: `[name]${!DEBUG ? '.[chunkhash]' : ''}.js`,
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/',
  },
  devServer: {
    hot: true,
    inline: true,
    port: 4000,
    compress: true
  },
  module: {
    rules: [{
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        // use: ['source-map-loader', 'tslint-loader'],
        loader: 'source-map-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'resolve-url-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            }
          ],
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'resolve-url-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                // includePaths: ['absolute/path/a', 'absolute/path/b'] path for styles
              }
            },
          ],
        }),
      },
      {
        test: /\.ttf$|\.eot|\.woff|\.woff2$/,
        loader: 'file-loader',
        options: {
          name: `fonts/[name]${!DEBUG ? '.[hash]' : ''}.[ext]`,
        },
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'file-loader',
        options: {
          name: `assets/[name]${!DEBUG ? '.[hash]' : ''}.[ext]`,
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          minimize: !DEBUG,
          removeComments: !DEBUG,
          collapseWhitespace: !DEBUG
        }

      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: !DEBUG ? 'cheap-source-map' : 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Learning playgoud',
      template: 'index.html',
    }),
    new ExtractTextPlugin(`styles/[name]${!DEBUG ? '.[hash]' : ''}.css`),
  ]
};

if (!DEBUG) {
  config.output.chunkFilename = '[name].[chunkhash].js';
  config.plugins.push(
    // new CleanWebpackPlugin(['dist']),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new WebpackChunkHash(),
    new ChunkManifestPlugin({
      filename: 'chunk-manifest.json',
      manifestVariable: 'webpackManifest',
    })
  );
} else {
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  );
}

module.exports = config;