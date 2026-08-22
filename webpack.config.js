const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        dashboard: './src/dashboard/dashboard.js',
        'media-player': './src/dashboard/media-player.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/dashboard'),
        filename: '[name].bundle.js',
        clean: true,
    },
    module: {
        rules: [
            { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset/resource' },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new HtmlWebpackPlugin({
            template: './src/dashboard/dashboard.html',
            filename: 'dashboard.html',
            chunks: ['dashboard', 'media-player'],
        }),
    ],
    devServer: {
        static: { directory: path.join(__dirname, 'public') },
        port: 8080,
        proxy: { '/api': 'http://localhost:3000' },
    },
};
