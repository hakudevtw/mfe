// used to merge webpack config, latter will override former
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("../package.json");

const DEV_PORT = 8082;

const devConfig = {
  mode: "development",
  devServer: {
    port: DEV_PORT,
    // historyApiFallback: true
    historyApiFallback: {
      index: "/index.html",
    },
  },
  output: {
    publicPath: `http://localhost:${DEV_PORT}/`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ModuleFederationPlugin({
      name: "auth",
      filename: "remoteEntry.js",
      exposes: {
        "./AuthApp": "./src/bootstrap",
      },
      shared: packageJson.dependencies,
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
