import * as d3 from 'd3';
import * as _ from 'underscore';
import groupClick from './group-click.js'
import resetChoices from './reset-choices.js'
require('smoothscroll-polyfill').polyfill;

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function collectChoices(){
    // Cycle through the buttons, see which ones are checked.
    const buttons = document.querySelectorAll("[data-checked='true'][data-filter-category][data-filter-value]");

    // This array will house the user-made choices
    let choices = [];

    // Cycle through each button and pluck it's data points. Store those points in the array.
    for(var i=0; i < buttons.length; i++){
        let button = buttons[i];
        choices.push({
            category:button.dataset.filterCategory,
            value:button.dataset.filterValue
        });
    }
    // Group the choices by column/category. This organizes the choices but still leaves a clunky
    // object between the groups and actual selected values
    choices =  _.groupBy(choices, choice => {
        return choice.category;
    });

    // Let's flatten the choices so that key/value pairs are category/array-of-values
    const groupKeys = Object.keys(choices);
    let flatChoices = {};
    groupKeys.forEach(key => {
        let values = [];
        choices[key].forEach( val => {
            values.push(val.value)
        })
        flatChoices[key] = values;
    })

    // window.yardsToGo = [document.getElementById('ytg_min').value, document.getElementById('ytg_max').value];
    // window.yardsInAir = [document.getElementById('yia_min').value, document.getElementById('yia_max').value];
    // window.yardsAfterCatch = [document.getElementById('yac_min').value, document.getElementById('yac_max').value];

    // For any min/max yardage forms, these choices are collected using this array.
    window.forms = [
        {
            arrayName:"yardsToGo",
            inputClass:'ytg',
            columnHeader:'YTG', 
            range:[document.getElementById('ytg_min').value, document.getElementById('ytg_max').value]
        },
        {
            arrayName:"yardsInAir",
            inputClass:'yia',
            columnHeader:'AIR_YDS',
            range:[document.getElementById('yia_min').value, document.getElementById('yia_max').value]
        },
        {
            arrayName:"yardsAfterCatch",
            inputClass:'yac',
            columnHeader:'YDS_AFTER_CATCH',
            range:[document.getElementById('yac_min').value, document.getElementById('yac_max').value]
        }
    ]
    return flatChoices;
}

function filterData(){
    
    const choices = collectChoices(),
        choicesKeys = Object.keys(choices);
    let filteredData = window.base_data;
        // For each category with a user choice cycle through the data and ditch any pass
        
        choicesKeys.forEach( key => {
            filteredData = _.filter(filteredData, pass =>{
                if (choices[key].indexOf(pass[key]) > -1){
                    return true;
                }
                return false;
            })
        });

        
        window.forms.forEach(form => {
            // TODO: Find better way of triggering filter b/c some fields have values less than 1.
            // if either of the the default YTG values has been changes then filter the data based on those user selections
                filteredData = _.filter(filteredData, pass => {
                    let yards = parseInt(pass[form.columnHeader]);
                    if (yards <= form.range[1] && yards >= form.range[0]){
                        return true;
                    }
                    return false;
                })
        })



        // Number of pass attempts in filtered set
        window.filteredTotal = filteredData.length;
        
        // Number of individual games in the filtered set.
        window.totalFilteredGames = _.uniq(filteredData, false, pass =>{
            return pass.GDATE;
        }).length;
        return aggregateData(filteredData);    
}


function aggregateData(data){
    /************
    // All this function does is take a json object as input and aggregate the number
    // of pass attempts into buckets of 20 yards and, within those buckets, by the five 
    // target areas. The end result should look like this: 
    *************/

    var groupedRows = _.groupBy(data, pass => {
        let yardage = parseInt(pass.YDS);
        if(pass.COMPLETION != 1){
            return 'incomplete'
        } else if (yardage <= 0){
            return 'negativeToZero';
        } else if (yardage < 5){
            return '1-4';
        } else if (yardage < 10){
            return '5-9';
        } else if (yardage < 15){
            return '10-14';
        } else if (yardage < 20){
            return '15-19';
        } else if (yardage < 40){
            return '20-39';
        } else if (yardage < 60){
            return '40-59';
        } else {
            return '60-plus';
        }
    });
    let rowKeys = Object.keys(groupedRows);
    rowKeys.forEach((row, index) => {
        let tempRow =  _.countBy(groupedRows[row], pass => pass.FIELD_TARGET);
        groupedRows[row] = tempRow;
    })
    return groupedRows;
}   

function initChart(){
    // Creates the scale which will be used to scale all the circles.
    const maxCircleDiameter = 200;
    let passMax = 0, 
    rowKeys = Object.keys(window.aggregated_data),
    colKeys = Object.keys(window.aggregated_data['negativeToZero']);

    rowKeys.forEach(row => {
        colKeys.forEach(column => {
            if(window.aggregated_data[row][column] && window.aggregated_data[row][column] > passMax){
                passMax = window.aggregated_data[row][column];
            }
        })
    })
    
    window.rScale = d3.scaleLinear()
        .domain([0, passMax])
        .range([0, maxCircleDiameter]);

    // Update the total in the bar chart
    d3.select('.chart__total')
        .text(d3.format(',')(window.baseTotal));
}

function visualizeData(data){
    console.log('New data', data);
    var passes = document.querySelectorAll('.passes__circle');
    passes.forEach(function(pass) {
        let column = pass.dataset.column;
        let row = pass.dataset.row;
        let passTotal = 0;
        if (data[column] != undefined && data[column][row] != undefined && data[column][row] > 0){
            passTotal = data[column][row];
        }
    
        let scaledPassTotal = window.rScale(passTotal);
        // Style/size circles and labels
        d3.select(pass)
            .style('height', `${scaledPassTotal}px`)
            .style('width', `${scaledPassTotal}px`)
            .style('margin', `${-0.5 * scaledPassTotal}px 0 0 ${-0.5 * scaledPassTotal}px`)
                .select('.passes__count')
                    .style('opacity',0)
                    .text(passTotal)
                    .style('font-weight', () => {
                        return passTotal > 0 ? "bold" : "normal";
                    })
                    .style('color', () => {
                        return passTotal > 0 ? "black" : "transparent";
                    })
                    .transition()
                    .duration(1000)
                    .style('opacity',1);
    })
    // Update the top bar chart
    const barWidthAsPercentage = window.filteredTotal / window.baseTotal;
    const total_width = d3.select('.chart__bar-wrapper').node().getBoundingClientRect().width;
    d3.select('.chart__bar')
        .transition()
        .duration(1000)
        .style('width', `${total_width * barWidthAsPercentage}px`)


        d3.select('.chart__bar-label').remove();
        if(total_width * barWidthAsPercentage > 150){
            
            d3.select('.chart__bar')
                .append('small')
                .classed('chart__bar-label', true);

        } else {
            
            d3.select('.chart__bar-wrapper')
                .append('small')
                .classed('chart__bar-label', true);
        }

    d3.select('.chart__bar-label')
        .text(`${ d3.format('.1%')(barWidthAsPercentage) }`);

    d3.select('.chart__now-showing')
        .text(d3.format(',')(window.filteredTotal));
    
    d3.select('.chart__total-games')
        .text(d3.format(',')(window.totalFilteredGames));

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
    let filterButtons = document.getElementsByClassName('filter-button');

    for (var filterButton of filterButtons){
        filterButton.addEventListener('click', e => {
            e.preventDefault();
            let filterButton = e.target;

            // Toggle the checked data-* attribute on the actual button
            filterButton.dataset.checked = filterButton.dataset.checked == "false" ? "true" : "false";
        })
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