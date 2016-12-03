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
	for (let part of route.parts) {
		console.log('part', part.from.name, part.to.name);
		console.log('from', document.querySelector('#station-' + part.from.id));
		console.log('to', document.querySelector('#station-' + part.to.id));
	}
}



let from = null
let to = null

const fetch = debounce(() => {
	vbb.routes(from, to, {results: 1})
	.then(([route]) => render(route))
	.catch(console.error)
}, 100)

const addStation = (id) => {
	if (to) from = id
	else if (from) to = id
	else from = id
	if (from && to) fetch()
}

map.addEventListener('click', (e) => {
	if (!e.target.classList.contains('station')) return
	if (!e.target.getAttribute('data-id')) return
	addStation(+e.target.getAttribute('data-id'))
})
