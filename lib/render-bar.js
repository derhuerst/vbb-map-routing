'use strict'

const h = require('virtual-dom/h')

const render = (state) =>
	h('div', {
		class: 'bar',
		style: {
			width: '15em',
			backgroundColor: 'white',
			borderRight: '1px solid #ccc',
			boxShadow: '0 0 2em rgba(0, 0, 0, .1)'
		}
	}, [
		h('p', {}, 'foo bar')
	])

module.exports = render
