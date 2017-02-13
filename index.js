'use strict'

const delegator = require('dom-delegator')
const debounce = require('debounce')
const vbb = require('vbb-client')
const document = require('global/document')
const h = require('virtual-dom/h')
const createElement = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
// const ms = require('ms')

const data = require('bvg-topological-map/index.json')
const renderMap = require('./lib/render-map')
const renderBar = require('./lib/render-bar')
const closestDistanceOnPath = require('./lib/closest-distance-on-path')
const slicePath = require('./lib/slice-path')
// const pathCenter = require('./lib/path-center')



const state = {
	fromQuery: '',
	toQuery: '',
	from: null,
	to: null,
	stations: [],
	slices: []
}



const setFromQuery = (value) => {
	state.fromQuery = value
	rerender()
}

const setToQuery = (value) => {
	state.toQuery = value
	rerender()
}

const search = () => {
	vbb.stations({
		results: 1, completion: true, query: state.fromQuery,
		identifier: 'vbb-map-routing'
	})
	.then(([station]) => console.log(station))
	.catch(console.error)

	vbb.stations({
		results: 1, completion: true, query: state.toQuery,
		identifier: 'vbb-map-routing'
	})
	.then(([station]) => console.log(station))
	.catch(console.error)
}

const addStation = (id) => {
	if (state.to) {
		state.from = id
		state.to = null
	} else if (state.from) state.to = id
	else state.from = id

	state.stations = []
	state.slices = []

	if (state.from && state.to) fetch()
	rerender()
}

const setRoute = (route) => {
	state.stations = []
	state.slices = []

	for (let part of route.parts) {
		const from = part.from.id
		const to = part.to.id
		const line = part.product ? part.product.line : null

		const fromEl = document.querySelector('#station-' + from)
		const toEl = document.querySelector('#station-' + to)
		const lineEl = document.querySelector('#line-' + line)

		if (fromEl && toEl && lineEl) {
			state.stations.push(from)
			part.passed.forEach((passed) => state.stations.push(passed.station.id))
			state.stations.push(from)

			const fromBBox = fromEl.getBBox()
			const fromX = fromBBox.x + fromBBox.width / 2
			const fromY = fromBBox.y + fromBBox.height / 2
			const fromPos = closestDistanceOnPath(fromX, fromY, lineEl)

			const toBBox = toEl.getBBox()
			const toX = toBBox.x + toBBox.width / 2
			const toY = toBBox.y + toBBox.height / 2
			const toPos = closestDistanceOnPath(toX, toY, lineEl)

			const shape = slicePath(lineEl, fromPos, toPos)
			state.slices.push({shape, line})
		}
	}

	rerender()
}

const actions = {
	setFromQuery, setToQuery, search,
	addStation,
	setRoute
}



const events = delegator()
events.listenTo('submit')

const render = (state, actions) =>
	h('div', {
		className: 'wrapper'
	}, [
		renderBar(state, actions),
		renderMap(state, actions)
	])

let tree = render(state, actions)
let root = createElement(tree)
document.body.appendChild(root)

const rerender = () => {
	const newTree = render(state, actions)
	root = patch(root, diff(tree, newTree))
	tree = newTree
}



const fetch = debounce(() => {
	vbb.routes(+state.from, +state.to, {
		results: 1, passedStations: true,
		tram: false, regional: false, express: false, bus: false,
		identifier: 'vbb-map-routing'
	})
	.then(([route]) => setRoute(route))
	.catch(console.error)
}, 100)

root.addEventListener('click', (e) => {
	if (!e.target.classList.contains('station')) return
	const id = e.target.getAttribute('data-id')
	if (id) addStation(id)
})
