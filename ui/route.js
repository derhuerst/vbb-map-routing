'use strict'

const h = require('virtual-dom/h')
const colors = require('vbb-util/lines/colors')
const ms = require('ms')

const styles = require('./route.css.js')

const renderLine = (part, i, details, actions) => {
	const line = part.line || {}
	const product = line.product
	const color = colors[product] && colors[product][line.name] || {}

	const passed = []
	if (details) {
		for (let stopover of part.passed.slice(1, -1)) {
			passed.push(h('li', {}, renderStation(stopover.station, actions)))
		}
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
			line.name || '?'
		]),
		part.direction ? ' → ' + part.direction : '',
		h('div', {
			className: styles.details + ''
		}, [
			ms(new Date(part.arrival) - new Date(part.departure)),
			', ',
			nrOfPassed,
		]),
		h('div', {
			className: styles.details + ''
		}, passed)
	])
}

const renderStation = (station, actions) =>
	h('div', {
		className: styles.link + '',
		'ev-click': () => actions.setHighlight(station.id)
	}, station.name)

const renderStopover = (station, actions) =>
	h('li', {
		className: styles.stopover + ''
	}, [
		renderStation(station, actions)
	])

const renderParts = (state, actions) =>
	state.route.parts.reduce((parts, part, i) => {
		if (i === 0) parts.push(renderStopover(part.origin, actions))

		const details = state.details.includes(i)
		parts.push(
			renderLine(part, i, details, actions),
			renderStopover(part.destination, actions)
		)

		return parts
	}, [])

const render = (state, actions) =>
	h('ul', {
		className: styles.route + ''
	}, state.route ? renderParts(state, actions) : [])

module.exports = render
