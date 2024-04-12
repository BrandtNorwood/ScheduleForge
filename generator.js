/*  File Holds functions for generating output.

    Niko Norwood - 3/10/2024
*/

function generateTable(){
    unfilteredGenData = parseWeek(fileData);
    var filteredGenData = filterPTO(unfilteredGenData);
    var activePTORequests = getActivePTORequests(unfilteredGenData);

    //Create table HTML object
    var table = document.createElement('table');
    table.setAttribute("id","table");

    //Use these to define feilds once instead of 500 times
    const feilds = ['Name','Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    //Creates Top lables
    let topLabels = document.createElement('tr'); 
    topLabels.style.background = "#c5c5c5"
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
    filteredGenData.forEach(employee =>{
        let empElement = document.createElement('tr');

        feilds.forEach(feild =>{
            feildElement = document.createElement('th');

            if (employee[feild] && !employee[feild].inactive) {
                if(employee[feild].filtered){}
                else {feildElement.style.background = pickColor(employee.Index);}

                if(employee[feild].changed){feildElement.style.textDecoration = "underline"; }

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

    table.appendChild(document.createElement("br"))

    //dates
    ptoDisplay = document.createElement("tr");
    activePTORequests.forEach((request,index) => {
        if (index%8 == 0){
            table.appendChild(ptoDisplay);
            ptoDisplay = document.createElement("tr");
        }

        requestElement = document.createElement("th");
        requestElement.style.background = pickColor(request.index);
        
        let start = request.request.start;
        let end = request.request.end;

        requestElement.appendChild(document.createTextNode(request.name));

        requestElement.appendChild(document.createElement("br"));

        requestElement.appendChild(document.createTextNode((start.getMonth()+1)+"/"+start.getDate()+" - "+(end.getMonth()+1)+"/"+end.getDate()));

        requestElement.style.fontSize = "small";

        ptoDisplay.appendChild(requestElement);
    })
    table.appendChild(ptoDisplay);

    console.log(activePTORequests);

    //clear outputPane, attach table
    document.getElementById("outputPane").replaceChildren();
    document.getElementById("outputPane").appendChild(table);

}


//Function filters out PTO requests
function filterPTO(data){
    let usedRequests = new Array();
    data.forEach(employee =>{
        if (employee.PTO){
            employee.PTO.forEach(request =>{
                const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
                days.forEach(day => {
                    if (employee[day]){
                        //console.log(employee.Name , employee[day] , request);

                        //Stack of logic for readability
                        var startB4start = employee[day].startTime >= request.start;
                        var endAfterEnd = employee[day].endTime <= request.end; 
                        var startB4End = employee[day].startTime <= request.end;
                        var startAfterStart = employee[day].startTime >= request.start;
                        var endB4End = employee[day].endTime <= request.end;
                        var endAfterStart = employee[day].endTime >= request.start;

                        //If the request encompases the entirity of the shift we unhighlight it
                        if(startB4start && endAfterEnd){
                            employee[day].filtered = true; 
                        }
                        //If the start of the request is after the start of the shift
                        else if (startAfterStart && startB4End){
                            employee[day].startTime = request.end;
                            employee[day].changed = true;
                        }
                        //if the end of the request is before the end and after the start of the shift
                        else if (endAfterStart && endB4End){
                            employee[day].endTime = request.start;
                            employee[day].changed = true;
                        }

                    }
                })
            })
        }
    });
    return data;
}



//
function getActivePTORequests(fullTable){
    var activeRequests = new Array();

    fullTable.forEach(employee =>{
        if (employee.PTO){
            employee.PTO.forEach(ptoRequest => {
                if (ptoRequest.start > genDate){
                    let weekEnd = new Date(genDate);
                    weekEnd.setDate(weekEnd.getDate() + 7);

                    if(ptoRequest.end < weekEnd){
                        activeRequests.push({request:ptoRequest, name:employee.Name, index:employee.Index});
                    }
                }
            })
        }
    })

    return activeRequests;
}



//Function for choosing the employee colors of the output table based on their index number
function pickColor(index){
    let map = ["#f5aa42", "#7de5ff", "#ff7d7d", "#a4ff7d", "#7db1ff", "#f4ff7d", "#88ff7d", "#e97dff", "#7dd8ff", "#837dff", "#86ff7d",
                 "#ff61a6", "#ffa261", "#61ffad", "#6193ff", "#ffad61", "#ff6193", "#ad61ff", "#adff61"];

    //Im aware this is bad practice but it works!
    if (index >= map.length){return pickColor(index-map.length);}
    else {return map[index];}
}



//Parses Time objects into Date Objects 
function parseWeek(inputData){
    var dataIn = deepCopy(inputData)

    //Chat GPT fixed this code! (it was very ugly before)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    //loop thru employees
    dataIn.forEach(employee => {
        daysOfWeek.forEach(day => {     //loop thru days
            if (employee[day]) {
                //pass times to a date generator
                employee[day].startTime = generateDay(daysOfWeek.indexOf(day), employee[day].startTime);
                employee[day].endTime = generateDay(daysOfWeek.indexOf(day), employee[day].endTime);

                //If the start time is after end time we assume its an overnight shift and roll end onto next day
                if (employee[day].startTime > employee[day].endTime){
                    employee[day].endTime.setDate(employee[day].endTime.getDate() + 1);
                }
            }
        });
    });

    return dataIn;
}

//used to set individual shifts for PTO Fitering
function generateDay(dayOfWeek, time){
    let newDay = new Date(genDate);

    newDay.setDate(newDay.getDate() + dayOfWeek);
    newDay.setHours(time.hour);
    newDay.setMinutes(time.minute);
    newDay.setSeconds(0);
    newDay.setMilliseconds(0);

    return newDay;
}



//Used to fix a bug with JSON deep copies and shalow copies overwriting filedata
function deepCopy(input) {
    if (Array.isArray(input)) {
        return input.map(item => deepCopy(item));
    } else if (typeof input === 'object' && input !== null) {
        const copiedObject = {};
        for (let key in input) {
            if (input.hasOwnProperty(key)) {
                if (input[key] instanceof Date) {
                    copiedObject[key] = new Date(input[key]); // Create a new Date object
                } else {
                    copiedObject[key] = deepCopy(input[key]);
                }
            }
        }
        return copiedObject;
    } else {
        return input;
    }
}