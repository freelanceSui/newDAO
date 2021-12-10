
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ProvidePlugin } = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const config = { 
    entry: './src/main.js',  
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build'),
        clean: {
            dry: true
        }
    },
    devServer: {
        historyApiFallback: true, 
        static: "./",
        port: 3001,
        open: true,
        hot: true,
    },
    module: {
        rules:[
            {
                test: /\.(c[ac]|c)ss$/i,
                use: [
                    { 
                        loader: MiniCssExtractPlugin.loader,
                        options: {publicPath: ""} 

                    },
                    "css-loader",
                    "postcss-loader", 
                    "sass-loader"
                ] 
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader", 
                }        
            },
            { 
                test: /\.(png|jpe?g|gif|svg|tiff|csv|mp4)$/i,
                type: "asset/resource"
            }
        ]
    },
    resolve: {
        extensions: ['.js', ".jsx"],
        fallback: {
            "assert": require.resolve("assert/"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve('buffer/'),
            "crypto": require.resolve("crypto-browserify"),
            "web3": require.resolve("web3")
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            inject: 'body'
        }),
        new CopyPlugin({
            patterns: [
                {from: './public/static', to: 'static'}
            ]
        }),
        new ProvidePlugin({process: ['process/browser.js']}),
        new ProvidePlugin({Buffer: ['buffer', 'Buffer']}),
        new MiniCssExtractPlugin(),
        new ReactRefreshWebpackPlugin(),
    ]
}

module.exports = config;