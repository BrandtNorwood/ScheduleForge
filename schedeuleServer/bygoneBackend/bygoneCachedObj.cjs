/* 
    Bygone Backend (file cached object handler
        a basic web service backend library

    
    by Niko Norwood 07/04/2024

*/

var fs = require('fs');

function bygoneOutput(message, bygoneParent){
    if (bygoneParent == null){
        console.log(message);
    } else {
        bygoneParent.log(message);
    }
}

function bygoneDebug(message, bygoneParent){
    if (bygoneParent == null){
        console.log(message);
    } else {
        bygoneParent.debug(message);
    }
}

//Brain is dead... no description
module.exports = class cachedFile {
    constructor (filePath, bygoneParent = null) {
        this.filePath = filePath;
        this.bygoneParent = bygoneParent;
        this.cache = {}

        if(fs.existsSync(filePath)){
            bygoneDebug("Cached object has been loaded from " + filePath,this.bygoneParent);
            this.updateCache()
        } else {
            bygoneOutput("ERROR : database file " + filePath + " does not exist. Attempting to create...",this.bygoneParent);
            this.updateFile()
        }
    }

    updateFile(){
        try {
            // Convert the fileCache object to a JSON string
            const data = JSON.stringify(this.cache, null, 2);
            
            // Write the JSON string to the database.json file
            fs.writeFileSync(this.filePath, data);
            
            bygoneDebug('Database file updated successfully!',this.bygoneParent);
        } catch (err) {
            bygoneOutput('!Error Writing to database file : '+err,this.bygoneParent);
        }
    }

    updateCache(){
        return new Promise ((resolve,reject) => {
            // Read the contents of the database.json file
            fs.readFile(this.filePath, (err, data) => {
                if (err) {
                    // If there's an error reading the file, send an error response
                    reject("Error reading file:", err);
                } else {
                    try {
                        // Parse the data as JSON
                        const jsonData = JSON.parse(data);
    
                        this.cache = jsonData;

                        bygoneDebug("Cache updated successfully!",this.bygoneParent);
    
                        resolve(jsonData);
    
                    } catch (parseError) {
                        // If there's an error parsing the JSON, send an error response
                        reject("Error parsing JSON:", parseError);
                    }
                }
            })
        })
    }
}