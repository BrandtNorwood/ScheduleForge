/*  Functions that are directly tied to UI but not editing or generator related

    Niko Norwood - 2/29/2024
*/

//These two functions handle the tab switcher button at the top of the page
function loadGenerator(){
    document.getElementById("serverStatus").style.display="none";
    document.getElementById("downloadDiv").style.display="none";
    document.getElementById("editButton").style.display="";
    document.getElementById("genButton").style.display="none";
    document.getElementById("edit").style.display="none";
    document.getElementById("outputPane").style.display="";
    
    generateTable();
}



//called whenever a change is saved as well as when the tab is opened
function loadEditor() {
    document.getElementById("serverStatus").style.display="none";
    document.getElementById("downloadDiv").style.display="none";
    document.getElementById("editButton").style.display="none";
    document.getElementById("genButton").style.display="";
    document.getElementById("edit").style.display="";
    document.getElementById("outputPane").style.display="none";

    clearPTOEdit();
    loadPreview();
    loadEMPSelect();
}



//Populates the week display feild
function loadWeekDisplay(){
    var weekDisplay = document.getElementById("weekDisplay");
    let endDate = new Date(genDate);
    endDate.setDate(endDate.getDate() + 7);

    weekDisplay.replaceChildren();
    weekDisplay.appendChild(document.createTextNode(
        (genDate.getMonth()+1) + "/" + genDate.getDate() + "/" + genDate.getFullYear() + " - " +
        (endDate.getMonth()+1) + "/" + (endDate.getDate()) + "/" + endDate.getFullYear()
    ));
}



//used to set the generator date one week ahead or behind
function timeSkipButton(forward){
    genDate.setDate(genDate.getDate() + (forward ? 7:-7));
    loadWeekDisplay();
    if (document.getElementById("editButton").style.display=="none"){loadPreview();}
    else{generateTable();}
}



//returns a date set to the next sunday
function AutoTimeSkip(thisDate){
    thisDate.setDate(thisDate.getDate() + (7-thisDate.getDay())); 
    thisDate.setHours(0);
    thisDate.setMinutes(0);
    thisDate.setSeconds(0);

    return thisDate;
}



//Parses a shift object into readable text
function outputDay(shiftObject){
    let start = shiftObject.start;
    let end = shiftObject.end;

    return (
        start.getHours() + ":" + 
        start.getMinutes().toString().padStart(2, '0') + " - " + 
        end.getHours() + ":" + 
        end.getMinutes().toString().padStart(2, '0')
    );
}