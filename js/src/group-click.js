import * as d3 from 'd3';

function groupClick(e, attribute, value){
    /*
        e = event object
        attribute = the data-* attribute to look for
        value = the value of the attribute desired
    */

    const button = e.target,
        checked = button.dataset.checked,
        filterButtons = document.querySelectorAll(`.filter-button[data-${attribute}]`),
        splitRegex = "/[,\/ ]/g";
    
    if (checked == false || checked == "false"){
        // If the group selection button is not itself checked, then we want to select the corresponding group.
        for (var filterButton of filterButtons){
            let dataAttributeValues=filterButton.dataset[attribute].split(/[,\/ ]/g);
            if (dataAttributeValues.indexOf(value) > -1){
                filterButton.dataset.checked = 'true';
            }
        }
    } else {
        // If the group selection button already is checked, then we want to remove the corresponding group for the choices selection.
        for (var filterButton of filterButtons){
            let dataAttributeValues=filterButton.dataset[attribute].split(/[,\/ ]/g);
            if (dataAttributeValues.indexOf(value) > -1){
                filterButton.dataset.checked = false;
            }
        }
    }
}
module.exports = groupClick;