'use strict'

const h = require('virtual-dom/h')
const colors = require('vbb-util/lines/colors')
const ms = require('ms')

const styles = require('./route.css.js')

const renderLine = (part, i, details, actions) => {
	const product = part.product || {}
	const mode = product.type || {}
	const color = colors[mode.type] && colors[mode.type][product.line] && colors[mode.type][product.line] || {}

	const passed = []
	if (details) {
		for (let stop of part.passed)
			passed.push(h('li', {}, stop.station.name))
	}

	const nrOfPassed = h('span', {
		className: styles.link + '',
		'ev-click': details ? () => actions.hidePartDetails(i) : () => actions.showPartDetails(i)
	}, (part.passed.length - 1) + ' stations')

	return h('li', {
		className: styles.line + '',
		style: {
			borderLeftColor: color.bg || mode.color || '#999'
		}
	}, [
		h('span', {
			className: styles.name + '',
			style: {
				backgroundColor: color.bg || '#555',
				color: color.fg || '#fff'
			}
		}, [
			product.line || '?'
		]),
		part.direction ? ' → ' + part.direction : '',
		h('div', {
			className: styles.details + ''
		}, [
			ms(new Date(part.end) - new Date(part.start)),
			', ',
			nrOfPassed,
		]),
		h('div', {
			className: styles.details + ''
		}, passed)
	])
}

const renderStop = (stop, actions) => {
	return h('li', {
		className: styles.stop + ''
	}, [
		h('div', {
			className: styles.link + ''
		}, stop.name)
	])
}

const renderParts = (state, actions) =>
	state.route.parts.reduce((parts, part, i) => {
		console.log(state.details)
		if (i === 0) parts.push(renderStop(part.from, true))

		const details = state.details.includes(i)
		parts.push(
			renderLine(part, i, details, actions),
			renderStop(part.to, actions)
		)

		return parts
	}, [])

const render = (state, actions) =>
	h('ul', {
		className: styles.route + ''
	}, state.route ? renderParts(state, actions) : [])

module.exports = render
