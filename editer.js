/*  File Holds functions for editing the csv file.

    Niko Norwood - TBD
*/

//These two functions handle the tab switcher button at the top of the page
function loadEditor() {
    document.getElementById("editButton").style.display="none";
    document.getElementById("genButton").style.display="";
    document.getElementById("edit").style.display="";
    document.getElementById("outputPane").style.display="none";
}

function loadGenerator(){
    document.getElementById("editButton").style.display="";
    document.getElementById("genButton").style.display="none";
    document.getElementById("edit").style.display="none";
    document.getElementById("outputPane").style.display="";
}



document.getElementById("empSelect").addEventListener("change", (event) => {
    loadPreview(event.target.value);
});


//Loads Preveiw pane. Most of this code is stolen from the table generator
function loadPreview(employeeSelected){
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

    genData.forEach(employee =>{

        if(employee.name == employeeSelected){

            let empElement = document.createElement('tr');

            feilds.forEach(feild =>{
                feildElement = document.createElement('th');

                if (employee[feild]) {
                    feildElement.style.background = pickColor(employee.Index);

                    if (feild == "Name"){
                        feildElement.appendChild(document.createTextNode(employee[feild]));
                    }else{
                        feildElement.appendChild(document.createTextNode(outputDay(employee[feild])));
                    }
                }
                empElement.appendChild(feildElement);
            });
            table.appendChild(empElement);
        }
    });

    //clear outputPane, attach table
    document.getElementById("previewPane").replaceChildren();
    document.getElementById("previewPane").appendChild(table);
}