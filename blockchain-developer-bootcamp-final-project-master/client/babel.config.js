const plugins = [];
if (process.env.ENV === 'development')plugins.push('react-refresh/babel')
// console.log(process.env)

module.exports = { 
    presets: [
        '@babel/preset-env', 
        ['@babel/preset-react', {runtime: "automatic"}] 
    ],
    plugins: plugins
}