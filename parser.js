/*  File Holds main functions for parsing the contents of the .csv or JSON data file

    Niko Norwood - 2/29/2024
*/

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
    toString() {
        return this.hour.padStart(2, '0') + ":" + this.minute.padStart(2, '0') + ":00";
    }
}



//take a 'start:end' format string and split it into two Time objects
function parseTime(rawTime){
    if(rawTime == ""){return;}

    rawTime = rawTime.split(':');
    
    if (rawTime.length == 2){
        var startTime = new Time (rawTime[0]);
        var endTime = new Time (rawTime[1]); 
    }else{return;}

    return {startTime,endTime};
}



//Stupid JS Date constructor needs ISO 8601 so ChatGPT whiped this up for me
function convertToISODate(dateString) {
    // Split the date string into month, day, and year components
    const [month, day, year] = dateString.split('/').map(Number);

    // Construct a new Date object using the components
    const dateObject = new Date(year, month - 1, day);

    // Convert the date object to an ISO 8601 format string
    const isoDateString = dateObject.toISOString().split('T')[0];

    return isoDateString;
}



//This function takes in a raw Date value, splits it into time and date, and creates a date object from it.
function parseDate(rawDate,start){
    //I was seeing \r in the rawDate value so this is a cheaty way around that
    rawDate = rawDate.trim()
    dateAndTime = rawDate.split('<');

    //if start value was not passed we assume its false
    if (start == null){start = false;}

    dateAndTime[0] = convertToISODate(dateAndTime[0]);

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
    if(rawPTO.trim() == ""){return null;}

    var requests = rawPTO.split('&'); //split by & symbol per formatting rules
    var outputs = new Array();

    requests.forEach(request => {
        startEnd = request.split(':');//split into start and end of request

        //if there is only one date present we pass it to both start and end and let the parseDate stretch the time
        if(startEnd.length > 1){
            outputs.push({start: parseDate(startEnd[0],true),end: parseDate(startEnd[1],false) });
        }else{
            outputs.push({start: parseDate(startEnd[0],true),end: parseDate(startEnd[0],false) });
        }
    });

    return outputs;
}



//function is called when user first selects file. Loads info and opens the editor
function loadOffline(fileName){
    readAndParseFile(fileName).then(result => {
        loadGenerator();//switch tabs
        fileData = [...result]; //copy of result
        generateTable(); //generate the table
    }).catch( err =>{
        document.getElementById("fileErrorPanel").innerText = err;
        console.log("Malformed file uploaded");
    });
}



//Downloads JSON of fileData Element
function downloadJSON(){
    if(!onlineMode){
        //create todays date for the filename
        let exportDate = new Date(Date.now());
        let formatExportDate = (exportDate.getMonth()+1) + "/" + exportDate.getDate() + "/" + exportDate.getFullYear();

        //define file
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fileData));

        //use hidden HTML element to download the file
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", `schedulerExport(${formatExportDate}).json`);
        dlAnchorElem.click();
    }
}



//Reads file and passes it to apropriate parser
function readAndParseFile(fileName) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function fileReadCompleted() {
            if (reader.result == null) {
                reject(new Error("File is empty"));
                return;
            }

            // Check if it's CSV or JSON and call the apropriate parser
            if(fileName.type == "text/csv"){
                parseCSVFile(reader.result)
                    .then(resolve)
                    .catch(reject);
            } else if (fileName.type == "application/json"){
                parseJSON(reader.result)
                    .then(resolve)
                    .catch(reject);
            } else {
                console.error("Improper File Selection!");
                document.getElementById("fileErrorPanel").innerText = "Improper File Type Selected!";
            }
        };
        reader.readAsText(fileName);
    });
}



//turns CSV file into usable object
function parseCSVFile(csvContent) {
    return new Promise((resolve, reject) => {
        //takes file output and sorts into rows
        var rows = csvContent.split('\n');

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
                    if (i>1&&i<9){thisUser[headers[i].trim()] = parseTime(element[i]);}
                    else if (i==9){thisUser[headers[i].trim()] = parsePTO(element[i]);}
                    else {thisUser[headers[i]] = element[i];}
                }
                rawObjects.push(thisUser);
            });
        }
        resolve(rawObjects);
    });
}



//turns JSON file into usable object
function parseJSON(jsonContent) {
    return new Promise((resolve, reject) => {
        //parse from JSON to array
        let jsonData = JSON.parse(jsonContent);

        //reconstruct Date objects in the pto feilds
        jsonData.forEach(employee => {
            if(employee.PTO){
                employee.PTO.forEach(request =>{
                    request.start = new Date(request.start);
                    request.end = new Date(request.end);
                })
            }
        })

        //get outa here
        resolve(jsonData);
    });
}



//
function getRemoteData(){
    fetch(Url + "/file")
    .then(response => response.text()) // Parse the response as text
    .then(function(data) {
        parseJSON(data).then(result=>{  
            //Once data has been received load it into fileData and parse
            fileData = [...result];
            loadGenerator();
        })
    }).catch(err=>{
        console.err("Server was unable to return data! - " + err);
    })
}



//
function contactServer(){
    let statusFeild = document.getElementById("serverStatus");
    statusFeild.innerText = "Connecting...";

    //Attempt to get status of server
    fetch(Url + "/status")
    .then(response => response.text()) // Parse the response as text
    .then(function(data) {
        //log that we connected
        console.log(`Server found at ${Url} and responded with "${data}"`);
        statusFeild.innerText = "Connected to server!"

        //set authentcation status and call next function
        if (data == "authentication_required"){
            onlineMode = "authOn";
            getRemoteData();
        }
        else if (data == "no_authentication") {
            onlineMode = "authOff";
            getRemoteData();
        }
        else{
            throw "Server found but returned bad responce"
        }


    }).catch(err => {
        statusFeild.innerText = "Offline mode (no server found)"
        console.log("Page in Offline mode! " + err);
    })
}