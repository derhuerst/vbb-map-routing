'use strict'

const {DateTime} = require('luxon')
const ms = require('ms')
const h = require('virtual-dom/h')
const createRenderJourney = require('vbb-journey-ui')

const formatTime = (when) => {
	return DateTime.fromJSDate(when, {
		zone: 'Europe/Berlin',
		locale: 'de-DE'
	}).toLocaleString(DateTime.TIME_SIMPLE)
}

const formatDelay = (delay) => {
	if (delay === 0) return null // todo: show +0
	const color = Math.abs(delay) >= 30 ? '#c0392b' : '#27ae60'
	const text = delay < 0
		? '-' + ms(-delay * 1000)
		: '+' + ms(delay * 1000)
	return h('span', {style: {color}}, [text])
}

const render = (state, actions) => {
	if (!state.journey) return null
	const renderJourney = createRenderJourney(formatTime, formatDelay, {
		showLegDetails: actions.showLegDetails,
		hideLegDetails: actions.hideLegDetails,
		selectStation: actions.setHighlight
	})

	return renderJourney(state.journey, state.details)
}

module.exports = render
