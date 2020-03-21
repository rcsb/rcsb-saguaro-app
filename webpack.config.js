const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        'rcsb-saguaro-app':'./src/RcsbFvWeb/RcsbFvWebApp.ts'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },{
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
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ]
    },
    output: {
        filename: 'RcsbFvWebApp.js',
        library: 'RcsbFvWebApp',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map'
};
