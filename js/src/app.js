import * as d3 from 'd3';
import * as _ from 'underscore';
import groupClick from './group-click.js';
import resetChoices from './reset-choices.js';
import drawLegend from './draw-legend.js';
import filterData from './filter-data.js';
import aggregateData from './aggregate-data.js';
import drawPieChart from './pie-chart.js';


// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function initChart(){
    // Creates the scale which will be used to scale all the circles.
    const maxCircleDiameter = 150;
    let passMax = 0, 
    rowKeys = Object.keys(window.aggregated_data),
    colKeys = Object.keys(window.aggregated_data['negativeToZero']);


    // Because the complete data is aggregated on initial load, we can cycle through the whole set 
    // and find the largest figure. This will be the scales domain max 
    rowKeys.forEach(row => {
        colKeys.forEach(column => {
            let tempTotal = window.aggregated_data[row][column];
            if(tempTotal && (tempTotal.incomplete + tempTotal.complete) > passMax){
                passMax = tempTotal.incomplete + tempTotal.complete;
            }
        })
    })
    window.rScale = d3.scaleLinear()
        .domain([0, passMax])
        .range([0, maxCircleDiameter]);

    // Update the total in the bar chart
    d3.select('.bar-chart__total')
        .text(d3.format(',')(window.baseTotal));

    drawLegend(window.rScale);
}

function visualizeData(data){
    console.log('New data', data);
    var passes = document.querySelectorAll('.passes__circle');
    passes.forEach(function(pass) {
        let column = pass.dataset.column;
        let row = pass.dataset.row;
        
        // passTotal is an array of the "complete", "incomplete" totals
        let passTotal = [0,0];
        let scaledPassTotal = 0;

        // first, make sure the data has info for this field zone
        if (data[column] != undefined && data[column][row] != undefined) {
            // console.log(data[column][row]);
            // Now, check the complete and incomplete. If they are greater than zero then drop them into the array
            if (data[column][row]["complete"] > 0){
                passTotal[0] = data[column][row]["complete"];
            }
            if (data[column][row]["incomplete"] > 0){
                passTotal[1] = data[column][row]["incomplete"];
            }
        }
        
        if(pass.classList.contains('passes__circle--all')){
            // We don't want the outer circle to just be incompletes.
            // It should be the total attempts (sum of inc and com)
            scaledPassTotal = window.rScale(passTotal[0] + passTotal[1]);
        } else {
            scaledPassTotal = window.rScale(passTotal[0]);
        };
        
        // Style/size circles and labels
        d3.select(pass)
            .style('height', `${scaledPassTotal}px`)
            .style('width', `${scaledPassTotal}px`)
            .style('margin', `${-0.5 * scaledPassTotal}px 0 0 ${-0.5 * scaledPassTotal}px`)
                .select('.passes__count')
                    .style('opacity',0)
                    .text(`${passTotal[0]}/${passTotal[0]+passTotal[1]}`)
                    .style('color', () => {
                        return passTotal[0]+passTotal[1] > 0 ? "white" : "transparent";
                    })
                    .style('text-shadow', () => {
                        return passTotal[0]+passTotal[1] > 0 ? "" : "none";
                    })
                    .transition()
                    .duration(1000)
                    .style('opacity',1);
    })

    // Update the top bar chart
    const barWidthAsPercentage = window.filteredTotal / window.baseTotal;
    const total_width = d3.select('.bar-chart__bar-wrapper').node().getBoundingClientRect().width;
    d3.select('.bar-chart__bar')
        .transition()
        .duration(1000)
        .style('width', `${total_width * barWidthAsPercentage}px`)


        d3.select('.bar-chart__bar-label').remove();
        if(total_width * barWidthAsPercentage > 150){
            d3.select('.bar-chart__bar')
                .append('small')
                .style('color', 'white')
                .classed('bar-chart__bar-label', true);
        } else {
            d3.select('.bar-chart__bar-wrapper')
                .append('small')
                .style('color', 'black')
                .classed('bar-chart__bar-label', true);
        }

    d3.select('.bar-chart__bar-label')
        .text(`${ d3.format('.1%')(barWidthAsPercentage) }`);

    d3.select('.bar-chart__now-showing')
        .text(d3.format(',')(window.filteredTotal));
    
    d3.select('.bar-chart__total-games')
        .text(d3.format(',')(window.totalFilteredGames));

    // Update the completion percentage pie chart
    let completionPercentage = window.completedPasses / window.filteredTotal;
    drawPieChart('#completion-percentage-chart', completionPercentage);
}

function drawChart(){
    visualizeData(filterData());
}

window.onload = function(){

    // #######################################
    // ####   EVENT LISTENERS
    // #######################################

    // ####   POSITION/PLAYERS FILTERS
    // Position buttons, making them select all relevant players
    for (var button of document.getElementsByClassName('filter-button--position')){
        button.addEventListener('click', function(e) {
            groupClick(e, "position", e.target.dataset.position);
            e.target.dataset.checked = e.target.dataset.checked == "true" ? "false" : "true";
        });
    }

    // ####   DIVISION/TEAMS FILTERS
    // Division buttons, making them select all relevant teams
    for (var button of document.getElementsByClassName('filter-button--division')){
        button.addEventListener('click', function(e) {
            groupClick(e, "division", e.target.dataset.division);
            e.target.dataset.checked = e.target.dataset.checked == "true" ? "false" : "true";
        });
    }

    // ####   CHECKING/UNCHECKING FILTER BUTTONS

    for (var filterButton of document.getElementsByClassName('filter-button')){
        filterButton.addEventListener('click', function(e) {
            console.log(e.target, 'clicked')
            // Toggle the checked data-* attribute on the actual button
            e.target.dataset.checked = e.target.dataset.checked == "true" ? "false" : "true";
        })
        // // Also do focus because without it, the buttons required a double click to register the event
        // filterButton.addEventListener('focus', e => {
        //     // Toggle the checked data-* attribute on the actual button
        //     e.target.dataset.checked = e.target.dataset.checked == "false" ? "true" : "false";
        // })
    }


    // ####   SUBMIT BUTTONS
    let submitButtons = document.querySelectorAll("[data-button-type='submit']");
    for (var submit of submitButtons){
        submit.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Uses node-based polyfill for new native scrolling spec.
            document.querySelector('#pass-bar-chart').scrollIntoView({ behavior: 'smooth' });
            drawChart();

        })  
    }

    // The unSelectAll button
    document.getElementsByClassName('control-button--selectNone')[0]
        .addEventListener('click', resetChoices);


    // The toggle labels button
    document.getElementsByClassName('control-button--labels')[0]
        .addEventListener('click', e => {
            if(e.target.classList.contains('checked')){
                e.target.innerHTML = "SHOW LABELS";
                e.target.classList.remove('checked');
            } else {
                e.target.innerHTML = "HIDE LABELS";
                e.target.classList.add('checked');
            }

            document.querySelectorAll('.passes__count').forEach(function(label){
                label.classList.toggle('hidden');
            });
        });


    // This opens/closes each filter section, letting people calm the madness if they choose.
    let sectionToggles = document.getElementsByClassName('filters__label');
    for (var sectionToggle of sectionToggles ){
        sectionToggle.addEventListener('click', function(e){
            e.preventDefault();
            console.log('click', e.target);
        
            // This turns the open/close indicator triangle on the link's parent element
            e.target.classList.toggle(`filters__label--closed`);
        
            // This opens/closes the section
            const target = e.target.dataset.target;
            const targetSections = document.querySelectorAll(`.filters__section--${target}`);
            for(let targetSection of targetSections){
                targetSection.classList.toggle('filters__section--closed')
            }
            
            
        });
    }
    
    // Loading the data
	d3.csv(`//${window.ROOT_URL}/data/pass-attempts.csv`, data => {
        // Start by taking the main data file, slicing off the header_descriptons row.
        window.base_data = data.splice(1, data.length - 1);
        window.aggregated_data = aggregateData(window.base_data);
        window.baseTotal = window.base_data.length;
        initChart();
        drawChart();
    });
}