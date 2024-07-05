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
const startBygone = require ('./bygoneBackend/bygoneBackend.cjs');
const cachedFile = require ('./bygoneBackend/bygoneCachedObj.cjs')

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



//Load server values
let databaseFilePath = path.join(__dirname, "employeeDatabase.json");
let logFilePath  = path.join(__dirname, "serverLog.txt")

//Had to make this into a full function because fucking JS kept skiping lines of code
console.log("-----Schedule Forge Server v0.2-----\n");

startBygone(logFilePath).then((bygone)=> {

    bygone.log("Loading Database...");
    var database = new cachedFile(databaseFilePath,bygone);

    //start Server
    app.listen(port, () =>{bygone.log(`Now listening on port ${port}`)})
});



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