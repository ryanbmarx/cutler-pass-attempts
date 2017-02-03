
function groupClick(e, attribute, value){
    /*
        e = event object
        attribute = the data-* attribute to look for
        value = the value of the attribute desired
    */

    const checked = e.target.dataset.checked,
        filterButtons = document.querySelectorAll(`.filter-button[data-${attribute}]`),
        splitRegex = "/[,\/ ]/g";
    if (checked == false || checked == "false"){
        console.log('checking')
        // If the group selection button is not itself checked, then we want to select the corresponding group.

        // Set the group selection button to checked
        e.target.dataset.checked = 'true';
        console.log(e.target, e.target.dataset)
        for (var filterButton of filterButtons){
            let dataAttributeValues=filterButton.dataset[attribute].split(/[,\/ ]/g);
            // console.log("CHECKING", attribute, value, value == filterButton.dataset[attribute], dataAttributeValues);
            if (dataAttributeValues.indexOf(value) > -1){
                // filterButton.classList.add('filter-button--checked');
                filterButton.dataset.checked = 'true';
            }
        }
    } else {
        console.log('unchecking')
        // If the group selection button already is checked, then we want to remove the corresponding group for the choices selection.

        // Set the group selection button to unchecked
        e.target.dataset.checked = 'false';
        for (var filterButton of filterButtons){
            let dataAttributeValues=filterButton.dataset[attribute].split(/[,\/ ]/g);
            console.log("unchecking", attribute, value, value == filterButton.dataset[attribute], dataAttributeValues);
            if (dataAttributeValues.indexOf(value) > -1){
                // filterButton.classList.remove('filter-button--checked');
                filterButton.dataset.checked = false;
            }
        }
    }
}


module.exports = groupClick;