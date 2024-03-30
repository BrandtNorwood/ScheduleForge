/*  NodeJs script to function as a server for web based scheduling application

    Niko Norwood - 03/24/2024
*/


const express = require('express');
const app = express();
var fs = require("fs");

const port = 3010;
var authEnabled = false;
var superUsers = new Array();

var fileCache = new Array();

console.log("INITIALIZING...");

// Middleware to parse JSON bodies
app.use(express.json());

//Cross origin setup since frontend is hosted seperatly                                 (This will need to be changed for Prod)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});



//Checks if database.json exists and updates fileCache
updateFileCache().then(output => {
    if(fileCache.length > 0) {  //anything other then empty should be good for now
        console.log(`\nData file found\n--Loaded ${fileCache.length} lines\n`);
    }
    else {
        throw new Error("--Data file missing!--\nname should be database.json");
    }
});



//Check for authentication file and load values if found
function loadSuperUsers(){
    try {
        const data = fs.readFileSync('superUsers.txt', 'utf8');
        console.log('\nUsing Athentication');
        authEnabled = true;
        let userArray = data.split('\n');
        userArray.forEach(user => {
            var [username, password] = user.split('=>').map(item => item.trim());

            superUsers.push({username:username,password:password})
        });

        console.log(`--Found ${superUsers.length} authorized users\n`);
    } catch (err) {
        console.error('\nNo Authentication is enabled on this server!\n');
    }
}
loadSuperUsers();



//Used to send state of server and prep client
app.get("/status", (req,res) => {
    res.send((authEnabled)? "authentication_required" : "no_authentication");
    console.log(`Status Handed as authentication:${authEnabled}`);                                  //console.log debug
});



// Sends the database.json file
app.get("/file", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    updateFileCache();
    console.log(`Data handed off`);                                                                 //console.log debug
    res.send(JSON.stringify(fileCache));
});



//receives employee and overwrite the file with that user changed
app.post("/saveEMP", (req,res) => {
    let user = req.body.userCred
    let selectedEmployee = req.body.selectedEmployee;
    let authenticated = false

    updateFileCache();

    if (authEnabled){
        superUsers.forEach(thisUser => {
            if (user.username == thisUser.username){
                if (user.password == thisUser.password){
                    authenticated = true;
                }
            }
        })
    } else { authenticated = true;}

    //receive employee and match by index. If its not found then append it to the end of the list.

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

    res.send({authenticated,status:"received"});
});



//start Server
app.listen(port, () =>{console.log(`Server Online at port ${port}`)})



//
function saveFileCache(){
    try {
        // Convert the fileCache object to a JSON string
        const data = JSON.stringify(fileCache, null, 2);
        
        // Write the JSON string to the database.json file
        fs.writeFileSync('database.json', data);
        
        console.log('Database file updated successfully!');                                 //console.log debug
    } catch (err) {
        console.error('Error writing to database file:', err);
    }
}



//read file and update the Cache
function updateFileCache(){
    return new Promise ((resolve,reject) => {
        // Read the contents of the database.json file
        fs.readFile("database.json", (err, data) => {
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


/*TODO

Retrieve JSON file, send to client

Receive updated data, overwrite file

Authentication on and off modes.
*/