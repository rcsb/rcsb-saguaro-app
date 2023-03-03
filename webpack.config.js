const path = require('path');

const commonConfig = {
    mode: "production",
    module: {
        rules: [
            {
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
                }, 'sass-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx' ],
        fallback: {
            fs: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    }
};

const webWorker = {
    ...commonConfig,
    entry: {
        'worker':'./build/src/RcsbFvWeb/RcsbFvWorkers/RcsbFvAlignmentCollectorWorker.worker.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist')
    }
};

const webBuilder = {
    ...commonConfig,
    entry: {
        'app':'./build/src/app.js'
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
        'plot':'./build/src/plot.js'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbChartWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    }
};

const webConstants = {
    ...commonConfig,
    entry: {
        'constants':'./build/src/constants.js'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbChartConstants',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        path: path.resolve(__dirname, 'build/dist')
    }
};

module.exports =[webWorker, webBuilder, webChart, webConstants];

