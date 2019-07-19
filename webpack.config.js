const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  entry: { index: "./src/index.js" },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.[hash:8].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        })
      }
      //   {
      //     test: /\.js$/,
      //     use: "babel-loader"
      //   }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 80,
    proxy: {
      "/sf":{target: "https://m.baidu.com/", secure: false}
    },
    disableHostCheck: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new CleanWebpackPlugin(),
    new ExtractTextPlugin("[name].css"),
    new CopyWebpackPlugin([
      {
        from: "./src/assets",
        to: "./assets"
      },
      {
        from: "./src/js",
        to: "./js"
      }
    ])
  ]
};
