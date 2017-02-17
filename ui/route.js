'use strict'

const h = require('virtual-dom/h')
const colors = require('vbb-util/lines/colors')
const ms = require('ms')

const styles = require('./route.css.js')

const renderLine = (part) => {
	const product = part.product || {}
	const mode = product.type || {}
	const color = colors[mode.type] && colors[mode.type][product.line] && colors[mode.type][product.line] || {}

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
			part.passed.length - 1,
			' stations'
		])
	])
}

const renderStop = (stop, first) => {
	return h('li', {
		className: [
			styles.stop,
			first ? styles.first : ''
		].join(' ')
	}, [
		h('div', {
			className: styles.name + ''
		}, [
			stop.name
		])
	])
}

const renderParts = (state, actions) =>
	state.route.parts.reduce((parts, part, i) => {
		if (i === 0) parts.push(renderStop(part.from, true))
		parts.push(renderLine(part), renderStop(part.to))

		return parts
	}, [])

const render = (state, actions) =>
	h('ul', {
		className: styles.route + ''
	}, state.route ? renderParts(state, actions) : [])

module.exports = render
