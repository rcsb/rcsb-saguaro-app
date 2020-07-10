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

const webApp = {
    ...commonConfig,
    //mode: "development",
    mode:"production",
    entry: {
        'rcsb-saguaro-app':'./build/src/RcsbFvWeb/RcsbFvBuilder.js'
    },
    output: {
        filename: 'app.js',
        library: 'RcsbFvWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    },
    devtool: 'source-map'
};

module.exports =[webApp];

