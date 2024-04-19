const path = require("path")
var fs = require("fs");


//                                                                          Stole these from the main function
//Overwrites the database file
function saveFileCache(){
    try {
        // Convert the fileCache object to a JSON string
        const data = JSON.stringify(fileCache, null, 2);
        
        // Write the JSON string to the database.json file
        fs.writeFileSync(path.join(__dirname, "new_database.json"), data);
        
        console.log('Database file updated successfully!');
    } catch (err) {
        console.log('!Error Writing to database file : ' , err);
    }
}



//read file and update the Cache
function updateFileCache(){
    return new Promise ((resolve,reject) => {
        // Read the contents of the database.json file
        fs.readFile(path.join(__dirname, "database.json"), (err, data) => {
            if (err) {
                // If there's an error reading the file, send an error response
                reject("Error reading file:", err);
            } else {
                try {
                    // Parse the data as JSON
                    const jsonData = JSON.parse(data);

                    fileCache = jsonData;

                    resolve(jsonData);

                } catch (parseError) {
                    // If there's an error parsing the JSON, send an error response
                    reject("Error parsing JSON:", parseError);
                }
            }
        })
    })
}

console.log("\n\n-----Schedule Forge Data Utility v0.1-----\n");
console.log("INITIALIZING...");

var fileCache = new Array();
updateFileCache().then(function(){

    if (fileCache.length < 1){return;}

    console.log("fileCache loaded");

    convertToTimeline();

    saveFileCache();

});

function convertToTimeline(){
    console.log("\nConverting file to timeline compatible");

    newFileCache = new Array()

    fileCache.forEach(employee=>{
        newEmployee = {Name:employee.Name,PTO:employee.PTO,Index:employee.Index};

        newEmployee.Shifts = new Array();

        newFileCache.push(newEmployee);

        console.log("Compleated operation on " + employee.Name);
    });

    fileCache = newFileCache;
}