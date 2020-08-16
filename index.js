'use strict'

require('regenerator-runtime/runtime')

const debounce = require('debounce')
const delegator = require('dom-delegator')
const document = require('global/document')
const createElement = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createClient = require('hafas-rest-api-client')
const scrollIntoView = require('scroll-into-view')

const names = require('vbb-stations/names.json')
const closestDistanceOnPath = require('./lib/closest-distance-on-path')
const slicePath = require('./lib/slice-path')

const styles = require('./ui/styles')
const render = require('./ui')

const findStationPosition = (id) => {
	const el = document.querySelector('#station-' + id)
	if (el) {
		const bbox = el.getBBox()
		return {x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2}
	}
	return null
}



const state = {
	from: {
		id: null,
		name: null,
		selection: null,
		suggestions: []
	},
	to: {
		id: null,
		name: null,
		selection: null,
		suggestions: []
	},
	searching: false,
	journey: null,
	details: [],
	stations: [],
	slices: [],
	highlight: null
}



const vbb = createClient('https://v5.vbb.transport.rest', {
	userAgent: 'https://github.com/derhuerst/vbb-map-routing',
})

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
		query,
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
	state.from.selection = findStationPosition(id)
	state.from.suggestions = []

	state.highlight = null
	if (!state.stations.includes(id)) state.stations.push(id)
	rerender()
}

const selectTo = (id, name) => {
	state.to.id = id
	state.to.name = name
	state.to.selection = findStationPosition(id)
	state.to.suggestions = []

	state.highlight = null
	if (!state.stations.includes(id)) state.stations.push(id)
	rerender()
}

const select = (id) => {
	if ((state.from.id && state.to.id) || !state.from.id) {
		selectFrom(id, names[id] ? names[id].name : null)

		state.to.id = null
		state.to.name = null
		state.to.selection = null
	} else {
		selectTo(id, names[id] ? names[id].name : null)
	}

	state.from.suggestions = []
	state.to.suggestions = []
	state.stations = []
	state.slices = []
	state.journey = null
	state.highlight = null

	if (state.from.id && state.to.id) search()
	rerender()
}

const setJourney = (journey) => {
	state.journey = journey
	state.stations = []
	state.slices = []
	state.details = []

	for (let leg of journey.legs) {
		let origin = leg.origin
		if (origin.station) origin = origin.station
		let destination = leg.destination.id
		if (destination.station) destination = destination.station
		const line = leg.line && leg.line.name || null

		// todo: find a better way to compute the bounding box, without using the DOM
		const fromEl = document.querySelector('#station-' + origin.id)
		const toEl = document.querySelector('#station-' + destination)
		const lineEl = document.querySelector('#line-' + line)

		if (fromEl && toEl && lineEl) {
			state.stations.push(origin.id)
			leg.stopovers.forEach((stopover) => {
				state.stations.push(stopover.stop.id)
			})
			state.stations.push(origin.id)

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
	state.searching = true
	rerender()

	vbb.journeys(state.from.id, state.to.id, {
		tram: false, regional: false, express: false, bus: false, ferry: false,
		results: 1,
		stopovers: true,
		remarks: false,
		// https://github.com/public-transport/vbb-hafas/blob/6f7dcde29741696e8a37f5d68ec0af60cc4bb717/index.js#L35-L44
		transferInfo: true,
	})
	.then((res) => {
		const [journey] = res.journeys
		state.searching = false
		setJourney(journey)
	})
	.catch((err) => {
		console.error(err)
		state.searching = false
		rerender()
	})
}

const showLegDetails = (part) => {
	if (state.details.includes(part)) return
	state.details.push(part)
	rerender()
}

const hideLegDetails = (part) => {
	const i = state.details.indexOf(part)
	if (i === -1) return
	state.details.splice(i, 1)
	rerender()
}

const setHighlight = (id) => {
	const el = document.querySelector('#station-' + id)
	if (!el) {
		console.error(`Could not find station ${id}.`)
		return
	}

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
	select,
	setJourney, search,
	showLegDetails, hideLegDetails,
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
