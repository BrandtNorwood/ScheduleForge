/*  File Holds main functions for parsing the contents of the .csv data file

    Niko Norwood - 2/29/2024
*/

//this function takes the given csv file and splits it into an array of objects

//Global Variables
var genDate = AutoTimeSkip(new Date(Date.now())); //Stores date 
var fileData = new Array(); //Used to store current state of the file
var genData = new Array();  //Used to store current weeks data

//Populates the week display feild
function loadWeekDisplay(){
    var weekDisplay = document.getElementById("weekDisplay");

    weekDisplay.replaceChildren();
    weekDisplay.appendChild(document.createTextNode(
        (genDate.getMonth()+1) + "/" + genDate.getDate() + "/" + genDate.getFullYear() + " - " +
        (genDate.getMonth()+1) + "/" + (genDate.getDate()+7) + "/" + genDate.getFullYear()
    ));
}

//used to set the generator date one week ahead or behind
function timeSkipButton(forward){
    genDate.setDate(genDate.getDate() + (forward ? 7:-7));
    loadWeekDisplay();
    generateTable();
}

//used to set individual shifts for PTO Fitering
function generateDay(dayOfWeek, time){
    let newDay = new Date(genDate);

    newDay.setDate(newDay.getDate() + dayOfWeek);
    newDay.setHours(time.hour);
    newDay.setMinutes(time.minute);
    newDay.setSeconds(0);

    return newDay;
}

//returns a date set to the next sunday
function AutoTimeSkip(thisDate){
    thisDate.setDate(thisDate.getDate() + (7-thisDate.getDay())); 
    thisDate.setHours(0);
    thisDate.setMinutes(0);
    thisDate.setSeconds(0);

    return thisDate;
}


function parseFile(fileName){
    return new Promise((resolve, reject) => {
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
                    //parses time or PTO where appropriate
                    for (let i=0;i<headers.length;i++){
                        if (i>1&&i<9){thisUser[headers[i]] = parseTime(element[i]);}
                        else if (i==9){thisUser[headers[i]] = parsePTO(element[i]);}
                        else {thisUser[headers[i]] = element[i];}
                    }
                    rawObjects.push(thisUser);
                });
                
                resolve(rawObjects);
            }
        };
        reader.readAsText(fileName);
    });  
}

//DIY Time class since you cant create just a time value in JS
class Time {
    //for when we want to pass a raw 4 char string as time
    constructor(rawTime){
        this.minute = rawTime.slice(-2);
        rawTime = rawTime.slice(0, -2); 
        this.hour = rawTime;
    }
    //subtract one Time object from another
    difference(diffTime){
        return new Time(this.hour - diffTime.hour, this.minute = diffTime.minute);
    }
    //Overloading the toString method for output
    toString(){
        return this.hour + ":" + this.minute;
    }
}

//take a 'start:end' format time and split it into two Time objects
function parseTime(rawTime){
    if(rawTime == ""){return;}

    rawTime = rawTime.split(':');
    
    if (rawTime.length == 2){
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
        return new Date(dateAndTime[0] + "T" + new Time(dateAndTime[1]).toString());
    }else {
        //If there is only a date and no time we use the start value to push out the time to either the start or end of the day
        if (start){
            return new Date(dateAndTime[0] + 'T00:00');
        } else {
            return new Date(dateAndTime[0] + "T23:59:59");
        }
    }
}

//Function takes the PTO requests and splits them into an array of start/end date objects
function parsePTO(rawPTO){
    if(rawPTO == ""){return;}

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

//Function for choosing the employee colors of the output table based on their index number
function pickColor(index){
    let map = ["#f5aa42", "#7de5ff", "#ff7d7d", "#a4ff7d", "#7db1ff", "#f4ff7d", "#88ff7d", "#e97dff", "#7dd8ff", "#837dff", "#86ff7d",
                 "#ff61a6", "#ffa261", "#61ffad", "#6193ff", "#ffad61", "#ff6193", "#ad61ff", "#adff61"];

    //Im aware this is bad practice but it works!
    if (index >= map.length){return pickColor(index-map.length);}
    else {return map[index];}
}

//function is called when user first selects file. Loads info and opens the editor
function loadPage(fileName){
    parseFile(fileName).then(result => {
        fileData = result;

        var empSelect = document.getElementById("empSelect");

        document.getElementById("downloadDiv").style.display="none";
        //document.getElementById("edit").style.display=""; Re-enable this pannel when its actualy built
        document.getElementById("outputPane").style.display="";
        generateTable();

        for (var i=0; i < fileData.length; i++){
            empSelect.options[empSelect.options.length] = new Option(fileData[i].Name);
        }
    });
}

function parseWeek(){
    genData = JSON.parse(JSON.stringify(fileData));

    //Chat GPT fixed this code! (it was very ugly before)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    genData.forEach(employee => {
        daysOfWeek.forEach(day => {
            if (employee[day]) {
                employee[day].startTime = generateDay(daysOfWeek.indexOf(day), employee[day].startTime);
                employee[day].endTime = generateDay(daysOfWeek.indexOf(day), employee[day].endTime);
            }
        });
    });
}

function filterPTO(){
    //Function will remove PTO requests from 
}

function outputDay(shiftObject){
    let start = shiftObject.startTime;
    let end = shiftObject.endTime;

    return (
        start.getHours() + ":" + 
        start.getMinutes().toString().padStart(2, '0') + " - " + 
        end.getHours() + ":" + 
        end.getMinutes().toString().padStart(2, '0')
    );
}

function generateTable(){
    parseWeek();

    //Create table HTML object
    var table = document.createElement('table');
    table.setAttribute("id","table");

    //Use these to define feilds once instead of 500 times
    const feilds = ['Name','Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    //Creates Top lables
    let topLabels = document.createElement('tr'); 
    for (let i = 0; i < feilds.length; i++){
        let labelElement = document.createElement('th');
        if (feilds[i] == "Name"){
            labelElement.appendChild(document.createTextNode(feilds[i]));
        } else{
            let thisDate = generateDay(i-1,new Time('0000'))
            labelElement.appendChild(document.createTextNode(
                feilds[i] + " " + (thisDate.getMonth()+1) + "/" + thisDate.getDate() + "/" + thisDate.getFullYear()
            ));
        }
        topLabels.appendChild(labelElement);
    }
    table.appendChild(topLabels);

    //Creates Employee Rows
    genData.forEach(employee =>{
        let empElement = document.createElement('tr');

        empElement.style.background = pickColor(employee.Index);

        feilds.forEach(feild =>{
            feildElement = document.createElement('th');

            if (employee[feild]) {
                if (feild == "Name"){
                    feildElement.appendChild(document.createTextNode(employee[feild]));
                }else{
                    feildElement.appendChild(document.createTextNode(outputDay(employee[feild])));
                }
            }
            empElement.appendChild(feildElement);
        });
        table.appendChild(empElement);
    });

    //clear outputPane, attach table
    document.getElementById("outputPane").replaceChildren();
    document.getElementById("outputPane").appendChild(table);

}
