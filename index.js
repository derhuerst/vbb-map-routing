'use strict'

const debounce = require('debounce')
const delegator = require('dom-delegator')
const document = require('global/document')
const createElement = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const vbb = require('vbb-client')
const scrollIntoView = require('scroll-into-view')

const names = require('vbb-stations/names.json')
const data = require('bvg-topological-map/index.json')
const closestDistanceOnPath = require('./lib/closest-distance-on-path')
const slicePath = require('./lib/slice-path')

const styles = require('./ui/styles')
const render = require('./ui')



const state = {
	from: {
		id: null,
		name: null,
		suggestions: []
	},
	to: {
		id: null,
		name: null,
		suggestions: []
	},
	route: null,
	details: [],
	stations: [],
	slices: [],
	highlight: null
}



const suggest = (which) => debounce((query) => {
	query = query.trim()
	state[which].id = null
	state[which].name = null
	rerender()

	if (query === '') {
		state[which].suggestions = []
		rerender()
		return
	}

	vbb.stations({
		query, completion: true,
		identifier: 'vbb-map-routing'
	})
	.then((suggestions) => {
		state[which].suggestions = suggestions
		rerender()
	})
	.catch(console.error)
}, 50)

const suggestFrom = suggest('from')
const suggestTo = suggest('to')

const selectFrom = (id, name) => {
	state.from.id = id
	state.from.name = name
	state.from.suggestions = []
	rerender()
}

const selectTo = (id, name) => {
	state.to.id = id
	state.to.name = name
	state.to.suggestions = []
	rerender()
}

const addStation = (id) => {
	if (state.from.id) {
		state.to.id = id
		state.to.name = names[id] ? names[id].name : null
	} else {
		state.from.id = id
		state.from.name = names[id] ? names[id].name : null
		state.to.id = null
		state.to.name = null
	}

	state.from.suggestions = []
	state.to.suggestions = []
	state.stations = []
	state.slices = []

	if (state.from.id && state.to.id) search()
	rerender()
}

const setRoute = (route) => {
	state.route = route
	state.stations = []
	state.slices = []
	state.details = []

	for (let part of route.parts) {
		const from = part.from.id
		const to = part.to.id
		const line = part.product ? part.product.line : null

		// todo: find a better way to compute the bounding box, without using the DOM
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

const search = () => {
	vbb.routes(+state.from.id, +state.to.id, {
		results: 1, passedStations: true,
		tram: false, regional: false, express: false, bus: false,
		identifier: 'vbb-map-routing'
	})
	.then(([route]) => setRoute(route))
	.catch(console.error)
}

const showPartDetails = (part) => {
	if (state.details.includes(part)) return
	state.details.push(part)
	rerender()
}

const hidePartDetails = (part) => {
	const i = state.details.indexOf(part)
	if (i === -1) return
	state.details.splice(i, 1)
	rerender()
}

const setHighlight = (id) => {
	const el = document.querySelector('#station-' + id)
	// todo: find a better way to compute the bounding box, without using the DOM
	const bbox = el.getBBox()
	const x = bbox.x + bbox.width / 2
	const y = bbox.y + bbox.height / 2

	state.highlight = {x, y}
	rerender()

	setTimeout(() => {
		const map = document.getElementById('map')
		scrollIntoView(el, {
			time: 300,
			validTarget: (el) => el === map
		})
	}, 10)
}

const actions = {
	suggestFrom, suggestTo,
	selectFrom, selectTo,
	addStation,
	setRoute, search,
	showPartDetails, hidePartDetails,
	setHighlight
}



delegator().listenTo('submit')

let tree = render(state, actions)
let root = createElement(tree)
document.body.appendChild(root)

const rerender = () => {
	const newTree = render(state, actions)
	root = patch(root, diff(tree, newTree))
	tree = newTree
}
