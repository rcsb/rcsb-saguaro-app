const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

const commonConfig = {
    mode: "development",
    module: {
        rules: [{
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: [{
                    loader:'@svgr/webpack',
                    options: {
                        expandProps: "end",
                        svgoConfig: {}
                    }
                }]
            },{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options:{
                    configFile:'tsconfig.server.dev.json'
                },
                exclude: /node_modules/
            },{
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
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
        extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
        fallback: {
            fs: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    },
    devtool: 'source-map'
};

const examples = [
    'ResidueDistribution',
    'GroupHistogram',
    'InstanceSequenceFv',
    'SingleEntitySummaryFv',
    'EntitySummaryFv',
    'UniprotGroupFv',
    'SequenceIdentityGroupFv',
    'UniprotFv',
    'SequenceIdentityGroupAlignmentFv',
    'UniprotEntityInstanceFv',
    'InstanceFv',
    'UniprotAlignmentFv',
    'ExternalDataProvider',
    'ChromosomeFv',
    'TestCollectors'
];
const entries = examples.reduce((prev,current)=>{prev[current]= fs.existsSync(`./src/RcsbFvExamples/${current}.ts`) ? `./src/RcsbFvExamples/${current}.ts` : `./src/RcsbFvExamples/${current}.tsx`;return prev;},{});

const server = {
    ...commonConfig,
    entry: {
        ...entries,
        'worker': {
            import: './src/RcsbFvWeb/RcsbFvWorkers/RcsbFvAlignmentCollectorWorker.worker.ts',
            filename: 'saguaro/worker.js'
        }
    },
    devServer: {
        compress: true,
        allowedHosts: "all",
        port: 9000
    },
    plugins: Object.keys(entries).map(key=>new HtmlWebpackPlugin({
        filename:`${key}.html`,
        template:'./src/RcsbFvExamples/index.html',
        inject: true,
        chunks:[key]
    })),
    output: {
        filename: '[name].js'
    }
}

module.exports = [server];