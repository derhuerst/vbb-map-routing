'use strict'

const css = require('csjs/get-css')
const insertStyles = require('insert-styles')

const index = require('./index.css.js')
const bar = require('./bar.css.js')
const map = require('./map.css.js')
const route = require('./route.css.js')

insertStyles([
	css(index),
	css(bar),
	css(map),
	css(route)
].join('\n'))
