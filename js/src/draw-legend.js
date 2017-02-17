import * as d3 from "d3";

// window.rScale

// This styles the chart legend

function drawLegend(rScale){
	const	allPasses = 300,
			completePasses = 100,
			width = rScale(allPasses),
			lineOffset = 40,
			textOffset = 5,
			scaledAllPass = rScale(allPasses) / 2, // circle radius/not diameter
			scaledCompletePass = rScale(completePasses) / 2; // circle radius/not diameter
	
	const legend = d3.select('#legend__container')
		.append('svg')
		.attr('height', 210)
		.attr('width', width);
	
	// ADD CIRCLES
	legend.append('circle')
		.classed('legend__circle', true)
		.classed('legend__circle--all', true)
		.attr('r', scaledAllPass)
		.attr('cx',scaledAllPass)
		.attr('cy',scaledAllPass + lineOffset);

	legend.append('circle')
		.classed('legend__circle--complete', true)
		.classed('legend__circle', true)
		.attr('r', scaledCompletePass)
		.attr('cx',scaledAllPass)
		.attr('cy',scaledAllPass + lineOffset);

	// ADD LABELS
	legend.append('text')
		.classed('legend__label', true)
		.text(`${allPasses} attempts`)
		.attr('x',width/2)
		.attr('y',0)
		.attr('text-anchor', 'middle')
		.attr('dy', '1em');

	legend.append('text')
		.text(completePasses)
		.classed('legend__label', true)
		.attr('text-anchor', 'middle')
		.attr('x',scaledAllPass)
		.attr('y',(scaledAllPass + lineOffset) * 2);

	legend.append('text')
		.text(`completions`)
		.classed('legend__label', true)
		.attr('text-anchor', 'middle')
		.attr('x',scaledAllPass)
		.attr('y',(scaledAllPass + lineOffset + 10.5) * 2 );

	// ADD LINES
	legend.append('line')
		.classed('legend__line', true)
		.classed('legend__line--all', true)
		.attr('x1',scaledAllPass)
		.attr('y1',22 )
		.attr('x2',scaledAllPass)
		.attr('y2',63)

	legend.append('line')
		.classed('legend__line', true)
		.classed('legend__line--complete', true)
		.attr('x1',scaledAllPass)
		.attr('y1',scaledAllPass + 50)
		.attr('x2',scaledAllPass)
		.attr('y2',(scaledAllPass * 2) + 60)
		
}


module.exports = drawLegend;