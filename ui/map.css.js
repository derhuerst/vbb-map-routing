'use strict'

const css = require('csjs')

const styles = css `
.inactive {
	opacity: .3;
}

.slice {
	fill: none;
}

.station {
	cursor: pointer;
}
.station.inactive:hover {
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

.station.interchange {
	fill: #fff;
	stroke: #000;
	stroke-width: .5;
}
`

module.exports = styles
