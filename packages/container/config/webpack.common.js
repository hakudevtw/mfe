module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // @babel/preset-env -> transform js to es5
            presets: ["@babel/preset-react", "@babel/preset-env"],
            // @babel/plugin-transform-runtime -> add some code to enable features in browser
            // Ex. async/await
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
    ],
  },
};
