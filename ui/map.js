'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')
const h2 = require('virtual-dom/h')
const _render = require('bvg-topological-map/render')

const styles = require('./map.css.js')

const renderSlices = (data, slices) => {
	const items = []

	for (let {shape, line} of slices) {
		items.push(h('path', {
			class: [
				styles.slice, line
			].join(' '),
			d: shape,
			style: {
				stroke: data.lines[line].color
			}
		}))
	}

	return h('g', {}, items)
}

const renderHighlight = (state) => {
	if (!state.highlight) return null
	return h('circle', {
		class: styles.highlight + '',
		r: 10,
		cx: state.highlight.x,
		cy: state.highlight.y
	})
}

const renderSelection = (selection) => {
	if (!selection) return null
	return h('circle', {
		class: styles.selection + '',
		r: 10,
		cx: selection.x,
		cy: selection.y
	})
}

const render = (state, actions) => {
	const rootProps = (h, opt, data) => {
		const props = _render.defaults.rootProps(h, opt, data)

		if (!props.style) props.style = {}
		props.style.width = (data.width * 2) + 'px'
		props.style.height = (data.height * 2) + 'px'

		return props
	}
	const labelProps = (h, id, pos) => {
		const props = _render.defaults.labelProps(h, id, pos)

		props.class += ' ' + styles.label
		if (state.journey && !state.slices.find(s => s.line === id)) {
			props.class += ' ' + styles.inactive
		}

		return props
	}
	const lineProps = (h, id, line) => {
		const props = _render.defaults.lineProps(h, id, line)
		if (state.journey) props.class += ' ' + styles.inactive
		return props
	}
	const stationProps = (h, id, station) => {
		const props = _render.defaults.stationProps(h, id, station)

		props.class += ' ' + styles.station
		if (station.wifi) props.class += ' ' + styles.wifi
		if (station.interchange) props.class += ' ' + styles.interchange
		if (state.journey && !state.stations.includes(id)) {
			props.class += ' ' + styles.inactive
		}
		props['ev-click'] = () => actions.select(id)

		return props
	}

	const middleLayer = (h, opt, data) => [
		renderSlices(data, state.slices)
	]
	const topLayer = (h, opt, data) => [
		renderSelection(state.from.selection),
		renderSelection(state.to.selection),
		renderHighlight(state)
	]

	return h2('div', {
		style: { overflow: 'scroll' }
	}, [
		_render(h, {
			rootProps,
			labelProps,
			lineProps,
			stationProps,
			middleLayer,
			topLayer
		})
	])
}

module.exports = render
