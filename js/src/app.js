import * as d3 from 'd3';
import * as _ from 'underscore';

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function collectChoices(){
    // Cycle through the buttons, see which ones are checked.
    const buttons = document.querySelectorAll('.button--checked');

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
        window.filteredTotal = filteredData.length;
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
        .range([0, 240]);

    // Update the total in the bar chart
    d3.select('.chart__total')
        .text(d3.format(',')(window.baseTotal));
}

function visualizeData(data){
    console.log('Redrawing chart');
    console.log(data);
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
        .select('small')
        .text(`${ d3.format('.1%')(barWidthAsPercentage) }`);

    d3.select('.chart__now-showing')
        .text(d3.format(',')(window.filteredTotal));

}

function drawChart(){
    visualizeData(filterData());
}


window.onload = function(){
    let buttons = document.getElementsByClassName('button')
    for (var button of buttons){
        button.addEventListener('click', e => {
            e.preventDefault();
            let button = e.target;
            let classlist = button.classList;

            // Toggle the checked class on the actual button
            if(classlist.contains('button--checked')){
                button.classList.remove('button--checked');
            } else {
                button.classList.add('button--checked');
            }

            // If this is the only checked filter option, then activate/un-mute the submit button(s).
            // If there are no checked filter options, then re-mute the submit button.
            let submitButtons = document.getElementsByClassName('control-button__submit');
            if (document.getElementsByClassName('button--checked').length > 0){
                for (var submit of submitButtons){
                    submit.classList.remove('muted');
                    submit.classList.add('active');
                }
            } else {
                for (var submit of submitButtons){
                    submit.classList.add('muted');
                    submit.classList.remove('muted');
                }
            }
        })
    }

    // Set up the event listener for the submit buttons. At load, the button is muted with class "muted"
    // but that class is removed when the first filter option is selected. The class "active" is added, and
    // is required by the function for the event listener.

    let submitButtons = document.getElementsByClassName('control-button__submit');

    for (var submit of submitButtons){
        submit.addEventListener('click', function(e) {
            e.preventDefault();
            if(submit.classList.contains('active')){
                // Only draw the chart if the button is active, i.e. the user has made filter selections.
                drawChart();
            } else {
                console.log("No selections made, don't redraw");
            }
        })  
    }
        
     
	d3.csv(`//${window.ROOT_URL}/data/pass-attempts.csv`, data => {
        // Start by taking the main data file, slicing off the header_descriotons row.
        window.base_data = data.splice(1, data.length - 1);
        window.aggregated_data = aggregateData(window.base_data);
        window.baseTotal = window.base_data.length;
        initChart();
        drawChart();
    });
}