'use strict'

const document = require('global/document')
const vbb = require('vbb-client')
const debounce = require('debounce')

const src = require('./map.svg')

const wrapper = document.createElement('div')
wrapper.innerHTML = src
const map = wrapper.querySelector('svg')
document.body.appendChild(map)
map.classList.add('map')
map.setAttribute('preserveAspectRatio', 'xMidYMid meet')



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

		const line = (part.product || {}).line
		if (line) {
			const lineEl = document.querySelector('#line-' + line)
			if (lineEl) lineEl.classList.remove('inactive')
			else console.error('could not find line', line)
		} else console.error('did not get line')
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
