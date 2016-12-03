'use strict'

const document = require('global/document')

const src = require('./map.svg')

const wrapper = document.createElement('div')
wrapper.innerHTML = src
const map = wrapper.querySelector('svg')
document.body.appendChild(map)
map.classList.add('map')
map.setAttribute('preserveAspectRatio', 'xMidYMid meet')
