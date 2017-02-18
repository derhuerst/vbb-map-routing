'use strict'

const css = require('csjs')

const styles = css `
.bar {
	padding: 0 .5em;
	width: 20em;
	box-sizing: border-box;
	background-color: white;
	border-right: 1px solid #ccc;
	box-shadow: 0 0 2em rgba(0, 0, 0, .1);
}
`

module.exports = styles
