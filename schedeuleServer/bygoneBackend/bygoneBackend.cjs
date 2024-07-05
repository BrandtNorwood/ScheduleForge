/* 
    Bygone Backend (console and log handler)
        a basic web service backend library

    
    by Niko Norwood 07/04/2024

*/

const { json } = require("express");
var fs = require("fs");

//get formatted datetime (stole this from Hangerlog)
function getTime(){
    const now = new Date(Date.now());
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');  
    return formattedDateTime;
}  



//This class and its functions are for logging output to the serverLog.txt
class Logger {
    constructor(filePath, flushInterval = 1000 , logMode = false, debugMode = false) {
        this.logMode = logMode;
        this.debugMode = debugMode;
        this.filePath = filePath;
        this.flushInterval = flushInterval;
        this.logQueue = [];
        this.timer = setInterval(() => this.flushQueue(), this.flushInterval);

        if(!fs.existsSync(filePath)){
            serverOutput("ERROR : Log file " + filePath + " does not exist. Attempting to create...");
            fs.writeFile(filePath , ("Log file generated by bygone - "+getTime()));
        }
    }

    log(message) {
        console.log(getTime() + "> " + message);
        if (this.logMode){
            this.logQueue.push(getTime() + "> " + message);
        }
    }

    debug(message) {
        function debugOutput(message) {
            if (this.debugMode){
                this.log(message);
            }
        }
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



module.exports = async function startBygone(logFilePath) {
    console.log("Loading Bygone v0.1");

    return new Promise((resolve,reject)=>{
        // Check for a config file
        const configFile = "./bygoneBackend/bygone_config.json";


        if (fs.existsSync(configFile)){
            fs.readFile(configFile, (err,data) => {
                const parsedData = JSON.parse(data);

                var debugMode = jsonData.debugMode;
                var logMode = jsonData.logMode;

                console.log("Config file loaded - using settings of logMode="+logMode+" and debugMode="+debugMode);
                const logger = new Logger(logFilePath, 2000, logMode, debugMode);
                resolve(logger);
            });

        } else {
            console.log("NO CONFIG FILE FOUND! - using defaults of logMode=false and debugMode=false");
            const logger = new Logger(logFilePath, 2000, true, true);
            resolve(logger);
        }
    });
}


// Close the logger when application exits
process.on('exit', () => {
    logger.close();
});