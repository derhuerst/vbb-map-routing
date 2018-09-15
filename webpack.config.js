'use strict'
const {join} = require('path')

module.exports = {
	entry: join(__dirname, 'index.js'),
	output: {
		path: join(__dirname, 'dist'),
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
	}
}
