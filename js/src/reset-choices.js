function resetChoices(){
    let filters = document.querySelectorAll('.filter-button');
    for (var filter of filters){
        filter.dataset.checked = false;
    }
    // d3.selectAll('.filter-button').attr('data-checked', "false");
    window.forms.forEach( form => {
        console.log(form, document.querySelector(`#${form.inputClass}_min`), `#${form.inputClass}_min`);
        
        document.querySelector(`#${form.inputClass}_min`).value = -25;
        document.querySelector(`#${form.inputClass}_max`).value = 100;  
    })
}

module.exports = resetChoices;