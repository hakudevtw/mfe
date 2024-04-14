// used to merge webpack config, latter will override former
const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("../package.json");

const DEV_PORT = 8080;

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
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        marketing: "marketing@http://localhost:8081/remoteEntry.js",
        auth: "auth@http://localhost:8082/remoteEntry.js",
      },
      shared: packageJson.dependencies,
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
