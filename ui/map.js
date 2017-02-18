'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')
const data = require('bvg-topological-map/index.json')

const styles = require('./map.css.js')

const css = (() => {
	let css = ''

	for (let line in data.lines) {
		const color = data.lines[line].color
		css += `
.${styles.lines} .${line}, .${styles.stations} .${line} {stroke: ${color}}`
	}

	return css
})()

const renderLabelDefs = () => {
	const r = []
	for (let id in data.labels) {
		const label = data.labels[id]

		r.push(h('g', {
			id: 'label-' + id
		}, [
			h('path', {
				fill: label.bg, d: label.body
			})
		].concat(label.caption.map((part) =>
			h('path', {
				fill: label.fg, d: part
			})
		))))
	}
	return r
}

const renderLabelUses = (state) => {
	const r = []
	for (let id in data.labels) {
		const label = data.labels[id]
		for (let position of label.positions) {
			const [x, y] = position

			const inactive = state.from && state.to
				? (state.slices.find(({line}) => line === id) ? '' : styles.inactive)
				: ''
			r.push(h('use', {
				class: [
					styles.label, id, inactive
				].join(' '),
				'xlink:href': '#label-' + id,
				href: '#label-' + id,
				transform: `translate(${x}, ${y})`
			}))
		}
	}
	return r
}

const renderLines = (state) => {
	const r = []
	for (let id in data.lines) {
		const line = data.lines[id]

		const inactive = state.from && state.to ? styles.inactive : ''
		r.push(h('path', {
			id: 'line-' + id,
			class: [
				styles.line, id, inactive
			].join(' '),
			d: line.shape
		}))
	}
	return r
}

const renderStation = (state, id, station, actions) => {
	let inactive = ''
	if (state.from && state.to) {
		if (!state.stations.includes(id)) inactive = styles.inactive
	}
	return h('path', {
		id: 'station-' + id,
		class: [
			styles.station, station.wifi ? styles.wifi : '', inactive
		].concat(station.lines).join(' '),
		d: station.shape,
		attributes: {'data-id': id},
		'ev-click': () => actions.addStation(id)
	})
}

const renderInterchanges = (state, actions) => {
	const r = []
	for (let id in data.stations) {
		const station = data.stations[id]
		if (!station.interchange) continue

		r.push(renderStation(state, id, station, actions))
	}
	return r
}

const renderStops = (state, actions) => {
	const r = []
	for (let id in data.stations) {
		const station = data.stations[id]
		if (station.interchange) continue
		r.push(renderStation(state, id, station, actions))
	}
	return r
}

const renderSlice = ({shape, line}) =>
	h('path', {
		class: [
			styles.slice, styles.line, line
		].join(' '),
		d: shape,
		style: {
			stroke: data.lines[line].color
		}
	})

const render = (state, actions) =>
	h('svg', {
		class: styles.map + '',
		xmlns: 'http://www.w3.org/2000/svg',
		'xmlns:xlink': 'http://www.w3.org/1999/xlink',
		width: data.width,
		height: data.height,
		viewBox: `0 0 ${data.width} ${data.height}`
	}, [
		h('style', {}, css),
		h('defs', {}, renderLabelDefs()),
		h('g', {}, state.slices.map(renderSlice)),
		h('g', {class: styles.labels + ''}, renderLabelUses(state)),
		h('g', {class: styles.lines + ''}, renderLines(state)),
		h('g', {class: styles.stations + ''}, [
			h('g', {class: styles.interchanges + ''}, [
				renderInterchanges(state, actions)
			])
		].concat(renderStops(state, actions)))
	])

module.exports = render