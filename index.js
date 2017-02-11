'use strict'

const debounce = require('debounce')
const vbb = require('vbb-client')
const document = require('global/document')
const createElement = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
// const ms = require('ms')

const renderMap = require('./lib/render-map')
const closestDistanceOnPath = require('./lib/closest-distance-on-path')
const slicePath = require('./lib/slice-path')
// const pathCenter = require('./lib/path-center')



const state = {
	from: null,
	to: null,
	line: null,
	passed: [],
	slices: []
}

const addStation = (id) => {
	if (state.to) {
		state.from = id
		state.to = null
	} else if (state.from) state.to = id
	else state.from = id

	state.passed = []
	state.slices = []
	state.line = null
	if (state.from && state.to) fetch()
	rerender()
}

const setRoute = (route) => {
	const part = route.parts[0] // todo: support all parts
	const from = part.from.id
	const to = part.to.id
	const line = part.product.line

	state.from = from
	state.to = to
	state.line = line
	state.passed = part.passed.map((passed) => passed.station.id)

	const fromEl = document.querySelector('#station-' + from)
	const toEl = document.querySelector('#station-' + to)
	const lineEl = document.querySelector('#line-' + line)

	if (fromEl && toEl && lineEl) {
		const fromBBox = fromEl.getBBox()
		const fromX = fromBBox.x + fromBBox.width / 2
		const fromY = fromBBox.y + fromBBox.height / 2
		const fromPos = closestDistanceOnPath(fromX, fromY, lineEl)

		const toBBox = toEl.getBBox()
		const toX = toBBox.x + toBBox.width / 2
		const toY = toBBox.y + toBBox.height / 2
		const toPos = closestDistanceOnPath(toX, toY, lineEl)

		const path = slicePath(lineEl, fromPos, toPos)
		state.slices = [{path, line}]
	}

	rerender()
}



let tree = renderMap(state)
let root = createElement(tree)
document.body.appendChild(root)

const rerender = () => {
	const newTree = renderMap(state)
	root = patch(root, diff(tree, newTree))
	tree = newTree
}



const fetch = debounce(() => {
	vbb.routes(+state.from, +state.to, {
		results: 1, passedStations: true,
		tram: false, regional: false, express: false, bus: false
	})
	.then(([route]) => setRoute(route))
	.catch(console.error)
}, 100)

root.addEventListener('click', (e) => {
	if (!e.target.classList.contains('station')) return
	const id = e.target.getAttribute('data-id')
	if (id) addStation(id)
})
