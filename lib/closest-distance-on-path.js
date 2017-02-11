'use strict'

const closestDistanceOnPath = (px, py, path) => {
	const fitness = (d) => {
		const {x, y} = path.getPointAtLength(d)
		return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
	}
	const range = path.getTotalLength()

	let lowerBoundary = 0
	let upperBoundary = path.getTotalLength()
	let bestD = null
	let bestF = 10000000
	for (let resolution = range / 2, i = 0; i < 50; resolution /= 2, i++) {

		bestD = null
		bestF = 10000000
		for (let d = lowerBoundary + resolution; d < upperBoundary; d += resolution) {
			const f = fitness(d)
			if (f < bestF) {
				bestD = d
				bestF = f
			}
		}

		lowerBoundary = Math.max(bestD - resolution, 0)
		upperBoundary = Math.min(bestD + resolution, range)
	}

	return bestD
}

module.exports = closestDistanceOnPath
