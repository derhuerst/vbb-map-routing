'use strict'

const css = require('csjs')

const styles = css `
.suggestions {
	margin: 0 0 .5em 0;
	padding: 0;
	list-style: none;
	text-align: left;
}

.suggestions li {
	padding: .2em .5em;
	cursor: pointer;
}
.suggestions li:hover {
	background-color: rgba(52, 152, 219, .4);
}
`

module.exports = styles
