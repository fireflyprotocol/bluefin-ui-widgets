const { constant } = require("lodash");
const path = require("path");

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	target: "node",
  mode:"production",
	plugins: [new NodePolyfillPlugin()],
	externalsPresets: {
		node: true,
	},
	externals: [nodeExternals()],
	entry: "./src/index.tsx",
	devtool: "inline-source-map",
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "dist/umd"),
		publicPath: path.resolve(__dirname, "dist/umd"),
		libraryTarget: "umd",
		library: "@bluefin/ui-widgets",
	},
	module: {
		rules: [
			{
				test: /\.(scss|css)$/,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
						},
					},
					{
						loader: "sass-loader",
					},
				],
			},
			{
				test: /\.svg$/,
				use: ["@svgr/webpack", "url-loader"],
			},
			{
				test: /\.(ts|tsx)$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},

	resolve: {
		extensions: [".tsx", ".ts", ".js", ".json", ".svg"],
		alias: {
			common: path.resolve(__dirname, "src/common/"),
			constants: path.resolve(__dirname, "src/constants/"),
			components: path.resolve(__dirname, "src/components/"),
			hooks: path.resolve(__dirname, "src/hooks/"),
			utils: path.resolve(__dirname, "src/utils/"),
			assets: path.resolve(__dirname, "src/assets/"),
		},
	},
	externals: [
		{
			react: {
				root: "React",
				commonjs2: "react",
				commonjs: "react",
				amd: "react",
			},
			"react-dom": {
				root: "ReactDOM",
				commonjs2: "react-dom",
				commonjs: "react-dom",
				amd: "react-dom",
			},
		},
	],
};
