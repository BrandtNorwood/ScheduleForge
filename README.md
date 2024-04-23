## Currently in process of major rework ##
*Readme will be updated soon but is not a priority item*

# Web Based Schedule generator #
*By Niko Norwood*

A small script to automate aspects of schedule creation. Developed for a user still using an excel spreadsheet without any automation. The site supports both local file uploading and downloading as well as local server storage using a nodeJS script. The primary data type is a JSON file storing the state of an array. Currently this project is not security focused and is intended to be used in a rather isolated enviroment. Security features will be implemented in the future. 


This project was initialy funded by the company who requested it but is not formaly licened and is now maintained for the public. Feel free to use it at [https://brandtnorwood.github.io/ScheduleForge/](url)

## Server based file storage

Servers function as a local way to store and access a schedule. When the program loads it does a lookup for port 3010 on the sites source location, and if it is found, it will attempt access the data on the server. Servers can be configured to either reqire authentication or not depending on if a superUsers.txt *(more secure format will be used later)* file is present in the same folder. Servers use JSON files as their data structure and do not currently posses the ability to generate one from scratch.
