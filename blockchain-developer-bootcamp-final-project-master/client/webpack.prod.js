require('dotenv').config({path: './.env'});
const Dotenv = require('dotenv-webpack'); 
const { merge } = require('webpack-merge'); 
const { EnvironmentPlugin } = require('webpack'); 
const config  = require('./webpack.common.js');
// console.log('prod settings', process.env)

const prodConfig = {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new EnvironmentPlugin({...process.env}), 
        new Dotenv({
            path: './.env',
            safe: true,
            allowEmptyValues: true,
            systemvars: true,
            silent: true,
            defaults: false
        }),
    ]
}

module.exports = merge(config, prodConfig);