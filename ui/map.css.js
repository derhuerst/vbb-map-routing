'use strict'

const css = require('csjs')

const styles = css `
.map {
	padding: 1em;
	max-height: 100%;
	box-sizing: border-box;
}

.inactive {
	opacity: .3;
}

.slice {
	fill: none;
}

.lines .line {
	fill: none;
	stroke-width: 1;
}

.stations .station {
	cursor: pointer;
	fill: none;
	stroke-width: 1;
}

.highlight {
	fill: none;
	stroke-width: 3;
	stroke: red;
}

.stations .interchanges .station {
	fill: #fff;
	stroke: #000;
	stroke-width: .5;
}

.stations .station.wifi {
	/* fill: #f9e800; */
}
`

module.exports = styles
