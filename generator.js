/*  File Holds functions for generating output.

    Niko Norwood - 3/10/2024
*/

function generateTable(){
    unfilteredGenData = parseWeek(genData);
    filteredGenData = filterPTO(unfilteredGenData);

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

            if (employee[feild]) {
                if(employee[feild].filtered){}
                else {feildElement.style.background = pickColor(employee.Index);}

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



//Function filters out PTO requests
function filterPTO(data){
    data.forEach(employee =>{
        if (employee.PTO){
            employee.PTO.forEach(request =>{
                const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
                days.forEach(day => {
                    if (employee[day]){
                        
                        if(employee[day].startTime > request.start , employee[day].endTime < request.end){employee[day].filtered = true;}
                    }
                })
            })
        }
    });
    return data;
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
function parseWeek(dataIn){
    dataIn = new Array();
    fileData.forEach(entry =>{dataIn.push(entry)});

    //Chat GPT fixed this code! (it was very ugly before)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dataIn.forEach(employee => {
        daysOfWeek.forEach(day => {
            if (employee[day]) {
                employee[day].startTime = generateDay(daysOfWeek.indexOf(day), employee[day].startTime);
                employee[day].endTime = generateDay(daysOfWeek.indexOf(day), employee[day].endTime);
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

    return newDay;
}