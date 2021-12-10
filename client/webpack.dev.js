require('dotenv').config({path: './.env.development'}); 
const Dotenv = require('dotenv-webpack');
const { merge } = require('webpack-merge'); 
const { EnvironmentPlugin } = require('webpack'); 
const config = require('./webpack.common.js');
// console.log('dev settings', process.env)
const devConfig = {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new EnvironmentPlugin({...process.env}),
        new Dotenv({
            path: './.env.development',
            safe: true,
            allowEmptyValues: true,
            systemvars: true,
            silent: true,
            defaults: false
        })
    ]
}

module.exports = merge(config, devConfig);