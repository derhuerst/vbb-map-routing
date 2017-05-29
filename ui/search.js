'use strict'

const h = require('virtual-dom/h')

const styles = require('./search.css.js')

const completion = () => {
	let value = ''
	return (field, query, suggestions, onSelect, suggest) =>
		[
			h('input', {
				type: 'text',
				placeholder: field,
				'ev-keypress': (e) => setTimeout(() => {
					value = e.target.value
					suggest(e.target.value)
				}, 1),
				value: query || value
			}),
			h('ul', {
				className: styles.suggestions + ''
			}, suggestions.map(({name, id}) =>
				h('li', {
					'ev-click': () => onSelect(id, name)
				}, name)
			))
		]
}

const fromCompletion = completion()
const toCompletion = completion()

const render = (state, actions) =>
	h('form', {
		action: '#',
		className: styles.search + ''
	}, [
		fromCompletion('from', state.from.name, state.from.suggestions, actions.selectFrom, actions.suggestFrom),
		toCompletion('to', state.to.name, state.to.suggestions, actions.selectTo, actions.suggestTo),
		h('button', {
			type: 'button',
			disabled: state.searching ? 'disabled' : null,
			'ev-click': () => actions.search()
		}, state.searching ? 'one moment…' : 'lets go')
	])

module.exports = render
