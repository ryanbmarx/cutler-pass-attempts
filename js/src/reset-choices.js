function resetChoices(){
    let filters = document.querySelectorAll('.filter-button');
    for (var filter of filters){
        filter.dataset.checked = false;
    }
    // d3.selectAll('.filter-button').attr('data-checked', "false");
    window.forms.forEach( form => {
        document.querySelector(`#${form.inputClass}_min`).value = -25;
        document.querySelector(`#${form.inputClass}_max`).value = 100;  
    })

    window.dropdowns.forEach(dropdown => {
        console.log(dropdown, document.querySelector(`#${dropdown.id} option[value=${'all'}]`));
        
        document.querySelector(`#${dropdown.id} option[value=${'all'}]`).selected = true;
    })
}

module.exports = resetChoices;