import * as _ from 'underscore';

function aggregateData(data){
    /************
    // All this function does is take a json object as input and aggregate the number
    // of pass attempts into buckets of 20 yards and, within those buckets, by the five 
    // target areas. 
    *************/

    let groupedRows = {};
    
    // Start by grouping all the rows of data (pass attempts) by the AIR_YDS attribute. 
    // These are the columns on desktop
    let groupedByYards = _.groupBy(data, pass => {
        let yardage = parseInt(pass.AIR_YDS);
        if (yardage <= 0){
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

    let colKeys = Object.keys(groupedByYards);
    colKeys.forEach((col, index) => {
        // Group each column by rows. Each row is a field target/L>R labeling
        let temp =  _.groupBy(groupedByYards[col], pass => pass.FIELD_TARGET);

        // For each row/column cell, group the passes by complete and incomplete, but
        // all we want is a count of the number of passes fitting the criteria.
        let rowKeys = Object.keys(temp);
        rowKeys.forEach(row =>{
            // group each of the rows by column
            temp[row] = _.countBy(temp[row], pass => {
                return pass.COMPLETION == 1 ? "complete" : "incomplete";
            });
        })
        // Insert our new, aggregated column into the object to be returned.
        groupedRows[col] = temp;
    })
    return groupedRows;
}   

module.exports = aggregateData;