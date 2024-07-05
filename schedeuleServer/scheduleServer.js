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
const bygone = require ('./bygoneBackend');

const port = 3010;

// Middleware to parse JSON bodies
app.use(express.json());

//Cross origin setup since frontend is hosted seperatly                                 (This will need to be changed for Prod)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});


let databaseFilePath = path.join(__dirname, "employeeDatabase.json");
let logFilePath  = path.join(__dirname, "serverLog.txt")


serverOutput("\n\n-----Schedule Forge Server v0.2-----\n");
serverOutput("INITIALIZING...");

var database = new cachedFile(databaseFilePath);
bygone.startBygone(logFilePath)

//Returns scheduled employees between certan dates (pre-parsed)
app.get("/getWeek", (req, res) => {

});



//Returns Employee name, groups, and id
app.get("/getEmployeeHeaders", (req, res) => {

});



//Returns Employee shifts
app.get("/getEmployeeShifts", (req, res) => {

});



//
app.get("/getEmployeePTOs", (req, res) => {

});



//start Server
app.listen(port, () =>{serverOutput(`Server Online at port ${port}`)})



// Close the logger when application exits
process.on('exit', () => {
    logger.close();
});