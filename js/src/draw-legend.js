import * as d3 from "d3";

// window.rScale

// This styles the chart legend

function drawLegend(rScale){
	const	allPasses = 200,
			completePasses = 100,
			width = rScale(allPasses),
			// lineOffset = 40,
			// textOffset = 5,
			scaledAllPass = width, // circle radius/not diameter
			scaledCompletePass = rScale(completePasses); // circle radius/not diameter
	
	const legend = d3.select('#legend__container')

	// ADD things top to bottom
	legend.append('p')
		.classed('legend__label', true)
		.text(`${allPasses} attempts`);

	const circles = legend
		.append('div')
		.classed('legend__circles-container', true)
		.attr('style', `height:${width}px;width:${width}px;`);

	legend.append('p')
		.text(`${completePasses} completions`)
		.classed('legend__label', true)

	
	// ADD CIRCLES
	circles.append('div')
		.classed('legend__circle', true)
		.classed('legend__circle--all', true)
		.attr('style', `height:${scaledAllPass}px;width:${scaledAllPass}px;`);

	circles.append('div')
		.classed('legend__circle--complete', true)
		.classed('legend__circle', true)
		.attr('style', `height:${scaledCompletePass}px;width:${scaledCompletePass}px;margin:${scaledCompletePass / -2}px 0 0 ${scaledCompletePass / -2}px`);

	// ADD LINES
	legend.append('div')
		.classed('legend__line', true)
		.classed('legend__line--all', true)

	legend.append('div')
		.classed('legend__line', true)
		.classed('legend__line--complete', true)
		
}


module.exports = drawLegend;