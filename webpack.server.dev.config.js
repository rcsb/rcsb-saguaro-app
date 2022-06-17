const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {
    mode: "development",
    module: {
        rules: [{
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
                }, 'sass-loader'],
                exclude: /node_modules/
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

const groupSeqId = {
    ...commonConfig,
    entry: {
        'sequence-id-group-fv':'./src/RcsbFvExamples/SequenceIdentityGroupFv.ts'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const groupUniprot = {
    ...commonConfig,
    entry: {
        'uniprot-group-fv':'./src/RcsbFvExamples/UniprotGroupFv.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const entitySummary = {
    ...commonConfig,
    entry: {
        'entity-summary-fv':'./src/RcsbFvExamples/EntitySummaryFv.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const singleEntitySummary = {
    ...commonConfig,
    entry: {
        'single-entity-summary-fv':'./src/RcsbFvExamples/SingleEntitySummaryFv.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const instanceSequence = {
    ...commonConfig,
    entry: {
        'instance-sequence-fv':'./src/RcsbFvExamples/InstanceSequenceFv.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const groupHistogram = {
    ...commonConfig,
    entry: {
        'group-histogram':'./src/RcsbFvExamples/GroupHistogram.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const residueDistribution = {
    ...commonConfig,
    entry: {
        'residue-distribution':'./src/RcsbFvExamples/ResidueDistribution.ts',
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/RcsbFvExamples/index.html'
    })],
};

const server = {
    ...commonConfig,
    entry: {
        //...groupSeqId.entry,
        //...groupUniprot.entry,
        //...entitySummary.entry,
        //...instanceSequence.entry,
        //...singleEntitySummary.entry,
        //...groupHistogram.entry,
        ...residueDistribution.entry
    },
    devServer: {
        compress: true,
        port: 9000,
    }
};

//module.exports =[groupUniprot, groupSeqId, entitySummary, server, instanceSequence, singleEntitySummary,groupHistogram, residueDistribution];
module.exports =[server, residueDistribution];

