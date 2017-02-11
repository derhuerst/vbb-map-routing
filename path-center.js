'use strict'

const properties = require('svg-path-properties')

const pathCenter = (simplified) => {
	const props = properties.svgPathProperties(simplified)
	return props.getPropertiesAtLength(props.getTotalLength() / 2)
}

module.exports = pathCenter
