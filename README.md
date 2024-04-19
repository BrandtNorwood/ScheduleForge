# Web Based Schedule generator #
*By Niko Norwood*

Currently in process of major rework

A small script to automate aspects of schedule creation. Developed for a user still using an excel spreadsheet without any automation. The site supports both local file uploading and downloading as well as local server storage using a nodeJS script. The primary data type is a JSON file storing the state of an array. Currently this project is not security focused and is intended to be used in a rather isolated enviroment. Security features will be implemented in the future. 


This project was initialy funded by the company who requested it but is not formaly licened and is now maintained for the public. Feel free to use it at [https://brandtnorwood.github.io/ScheduleForge/](url)


## CSV FILE FORMATTING RULES (Depreciated)

This project uses a basic CSV file to store data however that file must follow certian rules. Please read the folowing sections as well as review the example sheet if you plan on creating the table by hand. Otherwise the web editor <TODO> will do all this formating for you.


### Shift Formatting rules

The table has columns for each day of the week. If an employee is not working that day simply leave that column empty. Otherwise enter the shift in the format start:end using 24 hour time. For example 7:30AM - 4:30PM would become `730:1630` There is no need to remove days the employee takes off for PTO as script automaticly filters out PTO requests. 


### PTO formatting rules

A request for 12:00-14:00 on january 12th would look like `01/12/24<1200:01/12/24<1400` with the date and time seperated by `<` and the start and end times seperated by `:`
Multiple requests for the same user are seperated in the string by the `&` char. For example if the user also needed all of the 15th off it would become `01/12/24<1200:01/12/24<1400&01/15/24`
Date without time assumes the user will be taking the whole day off.

The Program should automaticly remove PTO requests that are older then a week from the current system time.


## Server based file storage

Servers function as a local way to store and access a schedule. When the program loads it does a lookup for port 3010 on the sites source location, and if it is found, it will attempt access the data on the server. Servers can be configured to either reqire authentication or not depending on if a superUsers.txt *(more secure format will be used later)* file is present in the same folder. Servers use JSON files as their data structure and do not currently posses the ability to generate one from scratch.
