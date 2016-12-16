'use strict'

const document = require('global/document')
const vbb = require('vbb-client')
const debounce = require('debounce')

const closestDistanceOnPath = require('./closest-distance-on-path')
const slicePath = require('./slice-path')
const src = require('./map.svg')

const wrapper = document.createElement('div')
wrapper.innerHTML = src
const map = wrapper.querySelector('svg')
document.body.appendChild(map)
map.classList.add('map')
map.setAttribute('preserveAspectRatio', 'xMidYMid meet')



const activate = (selector) =>
	Array.from(document.querySelectorAll(selector))
	.forEach((line) => line.classList.remove('inactive'))

const deactivate = (selector) =>
	Array.from(document.querySelectorAll(selector))
	.forEach((line) => line.classList.add('inactive'))

const render = (route) => {
	deactivate('.line')
	deactivate('.station')
	deactivate('.label')

	for (let part of route.parts) {
		if (!part.product) {
			console.warn('Missing mode of transport', part)
			continue
		}
		if (part.product.type.type !== 'subway'
		&& part.product.type.type !== 'suburban') {
			console.warn('Unsupported mode of transport', part.product)
			continue
		}

		activate('.label-' + part.product.line)
		for (let passed of part.passed) activate('#station-' + passed.station.id)

		const from = document.querySelector('#station-' + part.from.id)
		const to = document.querySelector('#station-' + part.to.id)
		const lineEl = document.querySelector('#line-' + part.product.line)

		if (from && to && lineEl) {
			const fromBBox = from.getBBox()
			const fromX = fromBBox.x + fromBBox.width / 2
			const fromY = fromBBox.y + fromBBox.height / 2
			const fromPos = closestDistanceOnPath(fromX, fromY, lineEl)

			const toBBox = to.getBBox()
			const toX = toBBox.x + toBBox.width / 2
			const toY = toBBox.y + toBBox.height / 2
			const toPos = closestDistanceOnPath(toX, toY, lineEl)

			const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			segment.setAttribute('d', slicePath(lineEl, fromPos, toPos))
			segment.style.stroke = window.getComputedStyle(lineEl).stroke
			segment.style.strokeWidth = '3'
			segment.style.fill = 'none'
			lineEl.parentNode.appendChild(segment)
		}
	}
}



const fetch = debounce(() => {
	vbb.routes(from, to, {
		results: 1, passedStations: true,
		tram: false, regional: false, express: false, bus: false
	})
	.then(([route]) => render(route))
	.catch(console.error)
}, 100)

let from = null
let to = null

const addStation = (id) => {
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
