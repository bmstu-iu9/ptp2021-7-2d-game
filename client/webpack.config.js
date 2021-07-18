const path = require('path')

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/client.js'), 
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
    },
}