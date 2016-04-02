var path = require('path');
var argv = require('yargs').argv;

var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

var myOptions = {
    out_path: 'build'
}

var webpackOptions = {
    //定义入口
    entry: {
        index: './src/index.tsx',
    },
    //定义输出目录和输出文件。文件名_hash值前10位。
    output: {
        path: path.resolve(myOptions.out_path),
        filename: '[name]_[hash:10].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.ts', '.tsx', '.css', '.png', '.jpg']
    },
    //针对不同类型的文件使用不同的loader
    module: {
        loaders: [
            { test: /\.(js$|jsx$)/, loader: 'babel', exclude: /(node_modules|bower_components)/, query: { presets: ['react', 'es2015'] } },
            { test: /\.(ts$|tsx$)/, loader: 'ts' },
            { test: /\.json$/, loader: 'json' },
            { test: /\.(png$|jpg$|gif$)/, loader: 'url?limit=4096&name=[hash:10].[name].[ext]' }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/views/index.html' }),
    ],
    //react和react-dom作为外部模块不要打包在一起。
    externals: [
        {
            //模块名:被引用时的变量名
            'react': 'React',
            'react-dom': 'ReactDOM'
        }
    ]
}

function cleanAndCopyVendor() {
    webpackOptions.plugins.push(new CleanWebpackPlugin([myOptions.out_path], { root: __dirname, verbose: true }))   //清理输出目录
    webpackOptions.plugins.push(new CopyWebpackPlugin([
        { from: 'node_modules/react/dist/react.js', to: 'vendor/react' },
        { from: 'node_modules/react-dom/dist/react-dom.js', to: 'vendor/react' }
    ]))   //复制库
}

if (argv.p) {//production
    //loaders
    webpackOptions.module.loaders.push({ test: /\.html$/, loader: 'raw!html-minify' })  //压缩html
    webpackOptions.module.loaders.push({ test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") })  //处理css    
    //plugins
    webpackOptions.plugins.push(new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("production") } }))   //定义环境变量
    webpackOptions.plugins.push(new ExtractTextPlugin("[name]_[hash].css"))   //css单独输出
    cleanAndCopyVendor()
} else {//development
    //loaders
    webpackOptions.module.loaders.push({ test: /\.css$/, loader: 'style!css' })  //处理css
    //plugins
    webpackOptions.plugins.push(new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("development") } }))   //定义环境变量
    if (argv.clean) cleanAndCopyVendor()    //如果指定了要clean目录，那么就clean目标目录
    //sourcemap
    webpackOptions.devtool = 'cheap-module-inline-source-map'  //生成sourcemap 
}

module.exports = webpackOptions
