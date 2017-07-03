'use strict'

const css = require('csjs/get-css')
const insertStyles = require('insert-styles')

const index = require('./index.css.js')
const bar = require('./bar.css.js')
const search = require('./search.css.js')
const map = require('./map.css.js')

insertStyles([
	css(index),
	css(bar),
	css(search),
	css(map)
].join('\n'))
