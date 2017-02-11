'use strict'

const simplify = require('simplify-geometry')
const lineSlice = require('@turf/line-slice')
const properties = require('svg-path-properties')

const linearizePath = (path, resolution) => {
	const points = []
	const props = properties.svgPathProperties(path.getAttribute('d'))
	const length = props.getTotalLength()

	for (let d = 0; d < length; d += resolution) {
		const {x, y} = props.getPointAtLength(d)
		points.push([x, y])
	}

	return points
	// return simplify(points, resolution)
}

const slicePath = (path, from, to) => {
	const points = linearizePath(path, .5)
	const props = properties.svgPathProperties(path.getAttribute('d'))

	from = props.getPointAtLength(from)
	from = {type: 'Feature', 'properties': {}, 'geometry': {
		type: 'Point', coordinates: [from.x, from.y]
	}}
	to = props.getPointAtLength(to)
	to = {type: 'Feature', 'properties': {}, 'geometry': {
		type: 'Point', coordinates: [to.x, to.y]
	}}

	const sliced = lineSlice(from, to, {
		type: 'Feature', properties: {},
		geometry: {type: 'LineString', coordinates: points}
	}).geometry.coordinates
	.map((p) => (Math.round(p[0] * 100) / 100) + ' ' + (Math.round(p[1] * 100) / 100))
	.join(' L ')

	return 'M ' + sliced
}

module.exports = slicePath
