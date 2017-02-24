import * as _ from 'underscore';

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

   
    window.dropdowns = [
        {
            id:"season",
            columnHeader:'SEASON',
            value:document.getElementById('season').value
        },
        {
            id:"week",
            columnHeader:'WEEK',
            value:document.getElementById('week').value
        }
    ]
    return flatChoices;
}

module.exports = collectChoices;