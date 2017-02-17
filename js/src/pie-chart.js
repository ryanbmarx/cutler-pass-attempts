// Cribbed from https://bl.ocks.org/mbostock/5100636

import * as d3 from "d3";

// var lookupTeamInfo = require('./lookup-team-info');
// var drawChart = require('./drawchart');
// var secondsToTime = require('./seconds-to-time');


function drawPieChart(container, chartPercentage){
	console.log('drawing a pie chart', container, chartPercentage);

	var tau = 2 * Math.PI; // http://tauday.com/tau-manifesto

	var containerRect = d3.select(container).node().getBoundingClientRect();

	var margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	}
	var width = containerRect.width,
		height = width,
		innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.left - margin.right,
		radius = height / 2;

	d3.select(container).selectAll('svg').remove();

	var arc = d3.arc()
	    .innerRadius(radius / 2)// This is the inner circle
	    .outerRadius(radius)
	    .startAngle(0);

	var chartInner = d3.select(container)
		.append('svg')
			.attr('width', width)
			.attr('height', height)
		.append('g')
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.classed('chart-inner', true);
	
	chartInner.append('text')
		.classed('pie-chart__label', true)
		.style('font-weight', 'bold')
		.attr("text-anchor", 'middle')
		.attr('dy', '.3em')
		// .attr('x',width/2)
		// .attr('y',height/2)
		.text(d3.format('.0%')(chartPercentage));

	var background = chartInner.append("path")
	    .datum({endAngle: tau})
	    .classed('pie-slice', true)
	    // .style("fill", "#ddd")
	    .attr("d", arc);

	var foreground = chartInner.append("path")
		.classed('pie-slice', true)
	    .classed('pie-slice--highlight', true)
	    .datum({endAngle: 0 * tau})
	    // .style("fill", 'red')
	    .attr("d", arc)
		.transition()
	      	.duration(750)
	      	.attrTween("d", arcTween(chartPercentage * tau));



      function arcTween(newAngle) {
		  return function(d) {
		    var interpolate = d3.interpolate(d.endAngle, newAngle);
		    return function(t) {
		      d.endAngle = interpolate(t);
		     return arc(d);
		    };
		  };
		}
}

module.exports = drawPieChart;