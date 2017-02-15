'use strict'

const h = require('virtual-dom/h')

const styles = require('./index.css.js')
const renderBar = require('./bar')
const renderMap = require('./map')

const render = (state, actions) =>
	h('div', {
		className: styles.wrapper + ''
	}, [
		renderBar(state, actions),
		renderMap(state, actions)
	])

module.exports = render
