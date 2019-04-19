/*
 * Clavis
 * Copyright (c) 2019 Andrew Ying
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const path = require("path");
const webpack = require("webpack");

const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const production = process.env.NODE_ENV === "production";

let config = {
  mode: production ? "production" : "development",
  node: {
    __dirname: false
  },
  context: path.resolve(__dirname, "src"),
  target: "electron-main",
  entry: {
    index: "./index.js",
    app: "./app.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(jpe?g|png|gif|ttf)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]"
          },
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: ExtractCssChunks.loader,
            options: {
              hot: !production
            }
          },
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    alias: {
      "~": path.resolve(__dirname, "node_modules")
    }
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new ExtractCssChunks(
      { filename: "style.css" }
    ),
    new CopyPlugin([
      { from: 'index.html', to: 'index.html' }
    ])
  ],
  optimization: {
    minimize: production,
    minimizer: []
  }
};

if (production) {
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify("production") }
    })
  );
  config.optimization.minimizer.push(new TerserPlugin({
    cache: true,
    parallel: true,
    sourceMap: true
  }));
} else {
  config.devtool = "source-map";
}

module.exports = config;