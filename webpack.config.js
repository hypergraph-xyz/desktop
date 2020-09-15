'use strict'

const { spawn } = require('child_process')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = (_, { mode = 'development' }) => {
  const port = 1212
  const publicPath =
    mode === 'production' ? './' : `http://localhost:${port}/dist`

  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: {
            loader: '@svgr/webpack',
            options: {}
          }
        },
        {
          test: /\.ttf$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader'
          }
        }
      ]
    },

    output: {
      path: `${__dirname}/build`,
      publicPath,
      filename: 'bundle.js'
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: `${__dirname}/static/index.html`
      })
    ],

    externals: [
      nodeExternals({
        allowlist: [/^@babel/]
      })
    ],

    resolve: {
      aliasFields: []
    },

    target: 'electron-renderer',

    entry: `${__dirname}/app/index.js`,

    mode,

    node: {
      __dirname: false,
      __filename: false
    },

    devServer: {
      port,
      publicPath,
      noInfo: true,
      contentBase: `${__dirname}/static`,
      watchOptions: {
        aggregateTimeout: 300,
        ignored: /node_modules/,
        poll: 100
      },
      before () {
        console.log('Starting Main Process...')
        spawn('npm', ['run', 'start:main'], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        })
          .on('close', code => process.exit(code))
          .on('error', err => console.error(err))
      }
    }
  }
}
