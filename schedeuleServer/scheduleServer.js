/*  NodeJs script to function as a server for web based scheduling application

    Niko Norwood - 03/24/2024
*/


const express = require('express');
const app = express();
var fs = require("fs");

const port = 3010;
var authEnabled = false;
var superUsers = new Array();

console.log("INITIALIZING...");

//Cross origin setup since frontend is hosted seperatly                                 (This will need to be changed for Prod)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
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
app.get("/status", (req,res) => {res.send((authEnabled)? "authentication_required" : "no_authentication")});



//start Server
app.listen(port, () =>{console.log(`Services Online at port ${port}`)})



/*TODO

Retrieve JSON file, send to client

Receive updated data, overwrite file

Authentication on and off modes.
*/