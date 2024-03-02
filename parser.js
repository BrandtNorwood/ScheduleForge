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

        //quick check to make sure the CSV file contains more then the headers
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

//DIY Time class since you cant create just a time value in JS
class Time {
    //for when we want to pass a raw 4char string as time
    constructor(rawTime){
        let splitTime = rawTime.match(/.{1,2}/g);
        this.hour = splitTime[0];
        this.minute = splitTime[1]
    }
    //for when we have seperate hour and min ints
    constructor(hour,minute){
        this.hour = hour;
        this.minute = minute;
    }
    //subtract one Time object from another
    diffrence(diffTime){
        return new Time(this.hour - diffTime.hour, this.minute = diffTime.minute);
    }
    //Overloading the toString method for output
    toString(){
        return this.hour + ":" + this.minute;
    }
}

//take a 'start:end' format time and split it into two Time objects
function parseTime(rawTime){
    rawTime = rawTime.split(':');
    
    if (rawTime.length = 2){
        var startTime = new Time (rawTime[0]);
        var endTime = new Time (rawTime[1]); 
    }else{return;}

    return {startTime,endTime};
}

//This function takes in a raw Date value, splits it into time and date, and creates a date object from it.
function parseDate(rawDate,start){
    dateAndTime = rawDate.split('<');

    //if start value was not passed we assume its false
    if (start == null){start = false;}

    if (dateAndTime.length > 1){
        return new Date(dateAndTime[0] + dateAndTime[1]);
    }else {
        //If there is only a date and no time we use the start value to push out the time to either the start or end of the day
        if (start){
            return new Date(dateAndTime[0] + "00:00");
        } else {
            return new Date(dateAndTime[0] + "23:59");
        }
    }
}

//Function takes the PTO requests and splits them into an array of start/end date objects
function parsePTO(rawPTO){
    var requests = rawPTO.split('&'); //split by & symbol per formatting rules
    var outputs = new Array();

    requests.forEach(request => {
        startEnd = request.split(':');//split into start and end of request

        //if there is only one date present we pass it to both start and end and let the parseDate stretch the time
        if(startEnd.length > 1){
            outputs.push({start: parseDate(startEnd[0],true),end: parseDate(startEnd[1],false)});
        }else{
            outputs.push({start: parseDate(startEnd[0],true),end: parseDate(startEnd[0],false)});
        }
    });

    return outputs;
}
