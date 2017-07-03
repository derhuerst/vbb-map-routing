'use strict'

const journey = require('vbb-journey-ui')

const renderJourney = (state, actions) => {
	return journey(state.route, state.details, actions)
}

module.exports = renderJourney
