import * as d3 from "d3";

// window.rScale

// This styles the chart legend

function drawLegend(){
	const	allPasses = 300,
			completePasses = 100,
			lineOffset = 15,
			textOffset = 5,
			scaledAllPass = window.rScale(allPasses) / 2, // circle radius/not diameter
			scaledCompletePass = window.rScale(completePasses) / 2; // circle radius/not diameter
	
	const legend = d3.select('#legend')
		.append('svg')
		.attr('height', 100)
		.attr('width', '100%');
	

	// ADD CIRCLES
	legend.append('circle')
		.classed('legend__circle--all', true)
		.attr('r', scaledAllPass)
		.attr('cx',scaledAllPass)
		.attr('cy',scaledAllPass);

	legend.append('circle')
		.classed('legend__circle--complete', true)
		.attr('r', scaledCompletePass)
		.attr('cx',scaledAllPass)
		.attr('cy',scaledAllPass);

	// ADD LABELS
	legend.append('text')
		.classed('legend__label', true)
		.text(`${allPasses} attempts`)
		.attr('text-anchor', 'left')
		.attr('x',scaledAllPass * 2 + lineOffset + textOffset)
		.attr('y',scaledAllPass / 2)
		.attr('dy', '.35em');

	legend.append('text')
		.text(`${completePasses} completions`)
		.classed('legend__label', true)
		.attr('text-anchor', 'left')
		.attr('x',scaledAllPass * 2 + lineOffset + textOffset)
		.attr('y',scaledAllPass)
		.attr('dy', '.35em');

	// ADD LINES
	legend.append('line')
		.classed('legend__line', true)
		.classed('legend__line--all', true)
		.attr('x1',scaledAllPass)
		.attr('y1',scaledAllPass / 2 )
		.attr('x2',scaledAllPass * 2 + lineOffset)
		.attr('y2',scaledAllPass / 2)

	legend.append('line')
		.classed('legend__line', true)
		.classed('legend__line--complete', true)
		.attr('x1',scaledAllPass)
		.attr('y1',scaledAllPass)
		.attr('x2',scaledAllPass * 2 + lineOffset)
		.attr('y2',scaledAllPass)
		
}


module.exports = drawLegend;