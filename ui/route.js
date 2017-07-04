'use strict'

const journey = require('vbb-journey-ui')

const renderJourney = (state, actions) => {
	const a = Object.create(actions)
	a.selectStation = actions.setHighlight
	return journey(state.route, state.details, a)
}

module.exports = renderJourney
