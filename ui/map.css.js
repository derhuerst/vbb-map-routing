'use strict'

const css = require('csjs')

const styles = css `
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
.stations .station.inactive:hover {
	opacity: 1;
}

.highlight {
	fill: none;
	stroke-width: 3;
	stroke: red;
}

.selection {
	fill: none;
	stroke-width: 3;
	stroke: #3498db;
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
