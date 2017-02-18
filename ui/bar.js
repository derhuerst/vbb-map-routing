'use strict'

const h = require('virtual-dom/h')

const styles = require('./bar.css.js')
const renderRoute = require('./route')
const renderSearch = require('./search')

const render = (state, actions) =>
	h('div', {
		className: styles.bar + ''
	}, [
		renderSearch(state, actions),
		renderRoute(state, actions)
	])

module.exports = render
