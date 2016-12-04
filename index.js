'use strict'

const document = require('global/document')
const vbb = require('vbb-client')
const debounce = require('debounce')
const simplify = require('simplify-geometry')
const absPath = require('abs-svg-path')
const parsePath = require('parse-svg-path')
const lineSlice = require('@turf/line-slice')

const src = require('./map.svg')

const wrapper = document.createElement('div')
wrapper.innerHTML = src
const map = wrapper.querySelector('svg')
document.body.appendChild(map)
map.classList.add('map')
map.setAttribute('preserveAspectRatio', 'xMidYMid meet')



const findClosestDistanceOnPath = (px, py, path) => {
	const fitness = (d) => {
		const {x, y} = path.getPointAtLength(d)
		return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
	}
	const range = path.getTotalLength()

	let lowerBoundary = 0
	let upperBoundary = path.getTotalLength()
	let bestD = null
	let bestF = 10000000
	for (let resolution = range / 2; resolution > (range / 100); resolution /= 2) {

		bestD = null
		bestF = 10000000
		for (let d = lowerBoundary + resolution; d < upperBoundary; d += resolution) {
			const f = fitness(d)
			if (f < bestF) {
				bestD = d
				bestF = f
			}
		}

		lowerBoundary = Math.max(bestD - resolution, 0)
		upperBoundary = Math.min(bestD + resolution, range)
	}

	return bestD
}

const linearizePath = (path, resolution) => {
	const points = []
	const length = path.getTotalLength()

	for (let d = 0; d < length; d += resolution) {
		const {x, y} = path.getPointAtLength(d)
		points.push([x, y])
	}

	return points
	// return simplify(points, resolution)
}

const slicePath = (path, from, to) => {
	const points = linearizePath(path, .5)

	from = path.getPointAtLength(from)
	from = {type: 'Feature', 'properties': {}, 'geometry': {
		type: 'Point', coordinates: [from.x, from.y]
	}}
	to = path.getPointAtLength(to)
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



const render = (route) => {
	Array.from(document.querySelectorAll('.line'))
	.forEach((line) => line.classList.add('inactive'))
	Array.from(document.querySelectorAll('.station'))
	.forEach((station) => station.classList.add('inactive'))
	Array.from(document.querySelectorAll('.label'))
	.forEach((label) => label.classList.add('inactive'))

	for (let part of route.parts) {
		console.log('part', part.from.name, part.to.name)
		if (part.product
			&& part.product.type.type !== 'subway'
			&& part.product.type.type !== 'suburban') continue

		Array.from(document.querySelectorAll('.label-' + part.product.line))
		.forEach((label) => label.classList.remove('inactive'))

		for (let passed of part.passed) {
			const el = document.querySelector('#station-' + passed.station.id)
			if (el) el.classList.remove('inactive')
		}

		const from = document.querySelector('#station-' + part.from.id)
		const to = document.querySelector('#station-' + part.to.id)

		const lineEl = document.querySelector('#line-' + part.product.line)
		if (from && to && lineEl) {

			const fromBBox = from.getBBox()
			const fromX = fromBBox.x + fromBBox.width / 2
			const fromY = fromBBox.y + fromBBox.height / 2
			const fromPos = findClosestDistanceOnPath(fromX, fromY, lineEl)

			const toBBox = to.getBBox()
			const toX = toBBox.x + toBBox.width / 2
			const toY = toBBox.y + toBBox.height / 2
			const toPos = findClosestDistanceOnPath(toX, toY, lineEl)

			const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			segment.setAttribute('d', slicePath(lineEl, fromPos, toPos))
			segment.style.stroke = window.getComputedStyle(lineEl).stroke
			segment.style.strokeWidth = '3'
			lineEl.parentNode.appendChild(segment)

		} else console.error('invalid data')
	}
}



let from = null
let to = null

const fetch = debounce(() => {
	vbb.routes(from, to, {
		results: 1, passedStations: true,
		tram: false, regional: false, express: false
	})
	.then(([route]) => render(route))
	.catch(console.error)
}, 100)

const addStation = (id) => {
	console.info('selecting', id)
	if (to) {
		from = id
		to = null
	} else if (from) to = id
	else from = id
	if (from && to) fetch()
}

map.addEventListener('click', (e) => {
	if (!e.target.classList.contains('station')) return
	if (!e.target.getAttribute('data-id')) return
	addStation(+e.target.getAttribute('data-id'))
})
