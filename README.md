# CSV Based Schedule generator #
*By Niko Norwood*

A small script to automate aspects of schedule creation. Developed for a user still using an excel spreadsheet without any automation. The site is built around the user uploading and downloading a CSV file instead of storing data in a server so there is no transfer of sensitive data over the internet. 


This project was initialy funded by the company who requested it but is not formaly licened and is now maintained for the public. Feel free to use it at <URL TBD> 


## CSV FILE FORMATTING RULES

This project uses a basic CSV file to store data however that file must follow certian rules. Please read the folowing sections as well as review the example sheet if you plan on creating the table by hand. Otherwise the web editor <TODO> will do all this formating for you.


### Shift Formatting rules

The table has columns for each day of the week. If an employee is not working that day simply leave that column empty. Otherwise enter the shift in the format start:end using 24 hour time. For example 7:30AM - 4:30PM would become `730:1630` There is no need to remove days the employee takes off for PTO as script automaticly filters out PTO requests. 


### PTO formatting rules

A request for 12:00-14:00 on january 12th would look like `01/12/24<1200:01/12/24<1400` with the date and time seperated by `<` and the start and end times seperated by `:`
Multiple requests for the same user are seperated in the string by the `&` char. For example if the user also needed all of the 15th off it would become `01/12/24<1200:01/12/24<1400&01/15/24`
Date without time assumes the user will be taking the whole day off.

The Program should automaticly remove PTO requests that are older then a week from the current system time.


## TODO
* Output Generation
  - BUG - Time Parser cannot process data that is formatted like 400 instead of 0400.
  - Parse the file into an array of employee objects
  - filter out PTO requests
  - generate the table
    - select colors from color table depending on index number


* Input Sheet
  - Select User and parse file into readable format
  - Allow editing current user
  - add new PTO Requests
    - Remove ones older then one week of current date when outputing
  - Add new User



Why did they pay me to make this instead of purchasing something else you may ask?
  No clue but I got paid non the less!
