const path = require('path');

const commonConfig = {
    module: {
        rules: [
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
        extensions: ['.js', 'jsx' ]
    }
};

const webWorker = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'worker':'./build/src/RcsbFvWeb/RcsbFvWorkers/RcsbFvAlignmentCollectorWorker.worker.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist')
    },
    devtool: 'source-map'
};

const webBuilder = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'app':'./build/src/app.js'
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFvWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    },
    devtool: 'source-map'
};

const webChart = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'plot':'./build/src/plot.js'
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

module.exports =[webWorker, webBuilder, webChart];

