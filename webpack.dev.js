const path = require('path');

const commonConfig = {
    mode: "development",
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },{
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: [/node_modules/]
            },
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'raw-loader'
            },{
                test: /\.s?css$/,
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
        extensions: [ '.tsx', '.ts', '.js', 'jsx' ]
    },
    devtool: 'source-map'
};

const webWorker = {
    ...commonConfig,
    entry: {
        'worker':'src/RcsbFvWeb/RcsbFvWorkers/RcsbFvAlignmentCollectorWorker.worker.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist')
    }
};

const webBuilder = {
    ...commonConfig,
    entry: {
        'app':'./src/app.ts'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFvWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    }
};

const webChart = {
    ...commonConfig,
    entry: {
        'plot':'./src/plot.ts'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbChartWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    },
    devtool: 'source-map'
};

const webConstants = {
    ...commonConfig,
    entry: {
        'constants':'./src/constants.ts'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbChartConstants',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        path: path.resolve(__dirname, 'build/dist')
    },
};

module.exports =[webWorker, webBuilder, webChart, webConstants];

