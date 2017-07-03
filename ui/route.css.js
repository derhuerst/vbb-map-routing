'use strict'

const css = require('csjs')

const styles = css `
.route {
	margin: 0;
	padding-left: 0;
	text-align: left;
	list-style: none;
	line-height: 1.4;
	color: #444;
}

.link {
	padding: 0 .25em;
	display: inline-block;
	line-height: 1.4;
	background-color: transparent;
	border-radius: .2em;
	cursor: pointer;
}
.link:hover {
	background-color: rgba(52, 152, 219, .4);
}

.stopover {
	padding: .2em 0;
	margin-left: .2em;
}

.stopover::before {
	margin-right: .3em;
	display: inline-block;
	width: 1em;
	text-align: center;
	content: '◉';
	font-family: monospace;
	line-height: inherit;
	color: #888;
}

.line {
	margin-left: .5em;
	padding: .2em 0 .2em 1.4em;
	border-left: .4em solid #999;
	font-size: 90%;
}

.line .product {
	display: inline-block;
	margin-right: .3em;
	width: 1.1em;
	height: 1.1em;
	vertical-align: middle;
}

.line .name {
	display: inline-block;
	padding: 0 .3em;
	line-height: 1.3;
	border-radius: .2em;
}

.line .details {
	padding: .2em 0;
	display: block;
	color: #777;
}
`

module.exports = styles
