'use strict'
const {join} = require('path')

const DIST = join(__dirname, 'dist')

module.exports = {
	entry: join(__dirname, 'index.js'),
	output: {
		path: DIST,
		filename: 'bundle.js'
	},
	target: 'web',
	module: {
		rules: [{
			test: /\.js$/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
		}]
	},
	devServer: {
		contentBase: DIST,
		port: 8080,
	},
}
