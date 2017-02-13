'use strict'

const h = require('virtual-dom/h')

const renderSearch = (state, actions) =>
	h('form', {
		action: '#',
		class: 'search'
	}, [
		h('input', {
			type: 'text',
			placeholder: 'from',
			'ev-keypress': (e) => actions.setFromQuery(e.target.value)
		}),
		h('input', {
			type: 'text',
			placeholder: 'to',
			'ev-keypress': (e) => actions.setToQuery(e.target.value)
		}),
		h('button', {
			type: 'button',
			'ev-click': () => actions.search()
		}, 'lets go')
	])

const render = (state, actions) =>
	h('div', {
		className: 'bar'
	}, [
		renderSearch(state, actions)
	])

module.exports = render
