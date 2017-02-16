import collectChoices from './collect-choices.js';
import aggregateData from './aggregate-data.js';
import * as _ from 'underscore';

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

module.exports = filterData;