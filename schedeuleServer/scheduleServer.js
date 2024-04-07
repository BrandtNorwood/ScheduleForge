/*  Schedule Server V0.1

    NodeJs script to function as a server for web based scheduling application

    Dependancies
        * NodeJS
        * Express

    Created by Niko Norwood on 03/24/2024
*/


const express = require('express');
const app = express();
const path = require("path")
var fs = require("fs");

const port = 3010;
var authEnabled = false;
var superUsers = new Array();

var fileCache = new Array();

const debugMode = true;
var logMode = false;

// Middleware to parse JSON bodies
app.use(express.json());

//Cross origin setup since frontend is hosted seperatly                                 (This will need to be changed for Prod)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});



//This class and its functions are for logging output to the serverLog.txt
class Logger {
    constructor(filePath, flushInterval = 1000) {
        this.filePath = filePath;
        this.flushInterval = flushInterval;
        this.logQueue = [];
        this.timer = setInterval(() => this.flushQueue(), this.flushInterval);
    }

    log(message) {
        this.logQueue.push(message);
    }

    flushQueue() {
        if (this.logQueue.length === 0) return;

        const messages = this.logQueue.join('\n') + '\n';
        fs.appendFile(this.filePath, messages, (err) => {
        if (err) {
            logMode=false;
            console.error('Error writing to log file:', err);
        } else {
            this.logQueue = [];
        }
        });
    }

    close() {
        clearInterval(this.timer);
        this.flushQueue();
    }
}
const logger = new Logger('serverLog.txt' , 2000); //Filepath, flush interval

serverOutput("\n\n-----Schedule Forge Server v0.1-----\n");
serverOutput("INITIALIZING...");
serverOutput(logMode? "Log loaded!" : "Log failed! No log will be created");



//get formatted datetime (stole this from Hangerlog)
function getTime(){
    const now = new Date(Date.now());
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
  
    return formattedDateTime;
}  



//Checks if database.json exists and updates fileCache
updateFileCache().then(output => {
    if(fileCache.length > 0) {  //anything other then empty should be good for now
        serverOutput(`Data file found\n--Loaded ${fileCache.length} lines\n`);
    }
    else {
        throw new Error("--Data file missing!--\nname should be database.json");
    }
}).catch(err => {throw new Error("Data file could not be loaded " + err);});



//This pair of functions is an easy way to cleanup and standardize output
function serverOutput(message) {
    console.log(getTime() + "> " + message);
    if (logMode){logger.log(getTime() + "> " + message);}
}

function debugOutput(message) {
    if (debugMode){
        serverOutput(message);
    }
}



//Check for authentication file and load values if found
function loadSuperUsers(){
    try {
        const data = fs.readFileSync('superUsers.txt', 'utf8');
        serverOutput('Using Athentication\n');
        authEnabled = true;
        let userArray = data.split('\n');
        userArray.forEach(user => {
            var [username, password] = user.split('=>').map(item => item.trim());

            superUsers.push({username:username,password:password})
        });

        serverOutput(`--Found ${superUsers.length} authorized users\n`);
    } catch (err) {
        console.error('No Authentication is enabled on this server!\n');
    }
}
loadSuperUsers();



//Used to send state of server and prep client
app.get("/status", (req,res) => {
    res.send((authEnabled)? "authentication_required" : "no_authentication");
    debugOutput(`-Status Handed as authentication:${authEnabled}`);
});



// Sends the database.json file
app.get("/file", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    updateFileCache();
    debugOutput(`Data handed off`);
    res.send(JSON.stringify(fileCache));
});



//receives employee and overwrite the file with that user changed
app.post("/saveEMP", (req,res) => {
    let user = req.body.userCred
    let selectedEmployee = req.body.selectedEmployee;
    let authenticated = authenticateUser(user);

    updateFileCache();

    //receive employee and match by index. If its not found then append it to the end of the list.
    if(authenticated){
        let employeeExists = false;
        fileCache.forEach((employee, index) => {
            if (selectedEmployee.Index === employee.Index){
                fileCache[index] = selectedEmployee; // Update the element in fileCache
                employeeExists = true; //Mark that a change has been made and no new employee needs to be created
            }
        });    

        if(!employeeExists){
            fileCache.push(selectedEmployee);
        }

        saveFileCache();
    }

    res.send({authenticated,status:(authenticated)?"received":"rejected"});
});



//
app.delete("/removeEMP", (req,res) => {
    let user = req.body.userCred
    let selectedEmployee = req.body.selectedEmployee;
    let authenticated = authenticateUser(user);
    let status = "rejected";

    updateFileCache();

    if(authenticated){
        const index = fileCache.findIndex(employee => employee.Index === selectedEmployee.Index);
        if (index > -1) {
            debugOutput(`Removed employee ${selectedEmployee.Name}`);
            fileCache.splice(index, 1);

            saveFileCache();
            status = "received"
        }
    }

    res.send({authenticated,status});
})



//start Server
app.listen(port, () =>{serverOutput(`Server Online at port ${port}`)})



// Close the logger when application exits
process.on('exit', () => {
    logger.close();
});




//
function authenticateUser(user){
    let authenticated = false;

    if (authEnabled){
        superUsers.forEach(thisUser => {
            if (user.username == thisUser.username){
                if (user.password == thisUser.password){
                    authenticated = true;
                }
            }
        })
    } else { authenticated = true;}

    return authenticated;
}



//
function saveFileCache(){
    try {
        // Convert the fileCache object to a JSON string
        const data = JSON.stringify(fileCache, null, 2);
        
        // Write the JSON string to the database.json file
        fs.writeFileSync('database.json', data);
        
        debugOutput('Database file updated successfully!');
    } catch (err) {
        serverOutput('!Error Writing to database file : ' , err);
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