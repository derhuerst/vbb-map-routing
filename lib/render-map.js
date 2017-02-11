'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')

const data = require('bvg-topological-map/index.json')

const common = `
#lines .line {
	fill: none;
	stroke-width: 1;
}

#stations .station {
	fill: none;
	stroke-width: 1;
}

#stations #interchanges .station {
	fill: #fff;
	stroke: #000;
	stroke-width: .5;
}

#stations .station.wifi {
	/* fill: #f9e800; */
}
`

const css = (() => {
	let css = common

	for (let line in data.lines) {
		const color = data.lines[line].color
		css += `
#lines .line.${line},  #stations .station.${line}  {stroke: ${color}}`
	}

	return css
})()

const renderLabelDefs = () => {
	const r = []
	for (let id in data.labels) {
		const label = data.labels[id]

		r.push(h('g', {
			id: 'label-' + id
		}, ([
			h('path', {
				fill: label.bg, d: label.body
			})
		]).concat(label.caption.map((part) =>
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

			const inactive = (state.line ? (state.line === id ? '' : ' inactive') : '')
			r.push(h('use', {
				class: 'label ' + id + inactive,
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

		const inactive = state.from && state.to ? ' inactive' : ''
		r.push(h('path', {
			id: 'line-' + id,
			class: 'line ' + id + inactive,
			d: line.shape
		}))
	}
	return r
}

const renderStation = (state, id, station) => {
	let inactive = ''
	if (state.from && state.to) {
		if (state.from !== id && state.to !== id && !state.passed.includes(id))
			inactive = ' inactive'
	}
	return h('path', {
		id: 'station-' + id,
		class: 'station ' + station.lines.join(' ') + (station.wifi ? ' wifi' : '') + inactive,
		d: station.shape,
		attributes: {'data-id': id}
	})
}

const renderInterchanges = (state) => {
	const r = []
	for (let id in data.stations) {
		const station = data.stations[id]
		if (!station.interchange) continue

		r.push(renderStation(state, id, station))
	}
	return r
}

const renderStops = (state) => {
	const r = []
	for (let id in data.stations) {
		const station = data.stations[id]
		if (station.interchange) continue
		r.push(renderStation(state, id, station))
	}
	return r
}

const renderSlice = ({path, line}) =>
	h('path', {
		class: 'slice line ' + line,
		d: path,
		style: 'stroke-width: 3; fill: none; stroke: ' + data.lines[line].color
	})

const render = (state) =>
	h('svg', {
		class: 'map',
		xmlns: 'http://www.w3.org/2000/svg',
		'xmlns:xlink': 'http://www.w3.org/1999/xlink',
		width: data.width,
		height: data.height,
		viewBox: `0 0 ${data.width} ${data.height}`
	}, [
		h('g', {}, state.slices.map(renderSlice)),
		h('style', {}, css),
		h('defs', {}, renderLabelDefs()),
		h('g', {id: 'labels'}, renderLabelUses(state)),
		h('g', {id: 'lines'}, renderLines(state)),
		h('g', {id: 'stations'}, [
			h('g', {id: 'interchanges'}, [
				renderInterchanges(state)
			])
		].concat(renderStops(state))
		)
	])

module.exports = render
