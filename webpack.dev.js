const HtmlWebpackPlugin = require('html-webpack-plugin');

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

const server = {
    ...commonConfig,
    entry: {
        ...groupSeqId.entry,
        ...groupUniprot.entry
    },
    devServer: {
        compress: true,
        port: 9000,
    }
};

module.exports =[groupUniprot, groupSeqId, server];

