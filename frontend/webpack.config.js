const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: path.join(__dirname, '/client/src/index.jsx'),

    output: {
        path: path.join(__dirname, '/client/dist'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            include: [path.join(__dirname, '/client/src')],
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react'],
                plugins: ['transform-object-rest-spread']
            }
        }, {
            test: /\.s?css$/,
            include: [path.join(__dirname, '/client/src'), path.resolve(__dirname, "node_modules/react-datepicker/dist/")],
            loaders: ['style-loader', 'css-loader', 'sass-loader']
        }, {
            test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
            loader: "url-loader?limit=8192&name=images/[name]-[hash].[ext]"
        }]
    },

    watch: true
}