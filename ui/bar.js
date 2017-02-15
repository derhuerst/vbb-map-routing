'use strict'

const h = require('virtual-dom/h')

const styles = require('./bar.css.js')

const renderSearch = (state, actions) =>
	h('form', {
		action: '#',
		className: styles.search + ''
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
		className: styles.bar + ''
	}, [
		renderSearch(state, actions),
		state.fromQuery
	])

module.exports = render
