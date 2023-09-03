const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

const config = {
  mode: "development",
};

module.exports = merge(commonConfig, config);
