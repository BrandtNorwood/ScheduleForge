/*  File Holds functions for editing the csv file.

    Niko Norwood - March 19 2024
*/
//
var selectedEmployee = new Object();



//These two functions handle the tab switcher button at the top of the page
function loadEditor() {
    document.getElementById("editButton").style.display="none";
    document.getElementById("genButton").style.display="";
    document.getElementById("edit").style.display="";
    document.getElementById("outputPane").style.display="none";
    loadPreview();
}

function loadGenerator(){
    document.getElementById("editButton").style.display="";
    document.getElementById("genButton").style.display="none";
    document.getElementById("edit").style.display="none";
    document.getElementById("outputPane").style.display="";
}



//Loads Preveiw pane. Most of this code is stolen from the table generator
function loadPreview(){
    var employeeSelected = document.getElementById("empSelect").value
    var unfilteredGenData = parseWeek(fileData);
    var filteredGenData = filterPTO(unfilteredGenData);

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

    fileData.forEach(employee =>{
        if(employee.Name == employeeSelected){selectedEmployee = employee;}
    });

    filteredGenData.forEach(employee =>{
        if(employee.Name == employeeSelected){

            let empElement = document.createElement('tr');

            feilds.forEach(feild =>{
                feildElement = document.createElement('th');

                if (employee[feild]) {
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

            loadTimeEditor();
        }
    });

    //clear outputPane, attach table
    document.getElementById("previewPane").replaceChildren();
    document.getElementById("previewPane").appendChild(table);
}



//to load times and checkboxes
function loadTimeEditor(){  
    let shiftEditor = document.getElementById("shiftEditor");
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    days.forEach(day => {
        if (selectedEmployee[day]){
            document.getElementById((day + "On")).checked = true;

            console.log(selectedEmployee[day].startTime.toString());
            document.getElementById(("start" + day)).value = selectedEmployee[day].startTime.toString();
            document.getElementById(("end" + day)).value = selectedEmployee[day].endTime.toString();
        } else {
            document.getElementById((day + "On")).checked = false;
        }
    });
}