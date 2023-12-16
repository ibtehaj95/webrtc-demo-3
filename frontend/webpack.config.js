const path = require("path");
const miniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "index.bundle.js",
    },
    devServer: {
        // https: true,
        port: 5000,
        historyApiFallback: true,   //for react router
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                use: [
                    miniCSSExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i, 
                loader: 'file-loader',
                options: {
                  name: './public/[name].[ext]'
                }
            },
        ],
    },
    plugins: [new miniCSSExtractPlugin()],
};
