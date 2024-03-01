/*  File Holds main functions for parsing the contents of the .csv data file

    Niko Norwood - 2/29/2024
*/

//this function takes the given csv file and splits it into an array of objects
function readFile(fileName){
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
        if(reader.result == null) {return;};

        //takes file output and sorts into rows
        var rows = reader.result.split('\n');

        //splits the rows into columns
        var rawValues = new Array();
        rows.forEach(element => {
            element = element.split(',');

            //only add if theres content in the rows and kill function if data is malformed
            if(element.length == 10){
                rawValues.push(element);
            } else if(element.length > 1){return;}
        });

        //quick check to make sure the CSV file contains more then the baseline
        if (rawValues.length > 1){

            //pop the headers off the top of the csv
            var headers = rawValues[0];
            rawValues.splice(0,1);

            var rawObjects = new Array();

            //loops down the rows
            rawValues.forEach(element =>{
                var thisUser = {};

                //creates objects from the rows defined by headers
                for (i=0;i<headers.length;i++){
                    thisUser[headers[i]] = element[i];
                }
                rawObjects.push(thisUser);
            });

            return rawObjects;

        }
    };
    reader.readAsText(fileName);  
}