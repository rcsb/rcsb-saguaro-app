const path = require('path');

const commonConfig = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: [/node_modules/]
            },{
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader'
            },{
                test: /\.scss$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName:'[local]'
                        }
                    }
                }, 'sass-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', 'jsx' ]
    }
};

const webWorker = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'worker':'./dist/src/RcsbFvWeb/RcsbFvWorkers/RcsbFvAlignmentCollectorWorker.worker.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/build')
    },
    devtool: 'source-map'
};

const webBuilder = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'app':'./dist/src/app.js'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFvWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'dist/build')
    },
    devtool: 'source-map'
};

module.exports =[webWorker, webBuilder];

