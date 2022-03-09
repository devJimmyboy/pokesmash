const path = require("path")

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

/**
 * @type {import('@storybook/core-common').StorybookConfig}
 */
module.exports = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    {
      name: "storybook-addon-next",
      options: {
        nextConfigPath: path.resolve(__dirname, "../next.config.js"),
      },
    },
  ],
  webpackFinal: async (config) => {
    // @ts-ignore
    config.resolve.plugins = [
      // @ts-ignore
      ...(config.resolve.plugins || []),
      // @ts-ignore
      new TsconfigPathsPlugin({
        // @ts-ignore
        extensions: config.resolve.extensions,
      }),
    ]
    return config
  },
  features: {
    postcss: false,
  },
  staticDirs: [path.resolve(__dirname, "../public")],
  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
}
