 # FJC Line Scheduler

A small script to automate aspects of schedule creation for the line department at Fargo Jet Center
Eventualy this project will become an open source tool avalible to the public once it's passed its initial stages

----PTO formatting rules----

A request for 12:00-14:00 on january 12th would look like `01/12/24<1200:01/12/24<1400` with the date and time seperated by `<` and the start and end times seperated by `:`
Multiple requests for the same user are seperated in the string by the `&` char. For example if the user also needed all of the 15th off it would become `01/12/24<1200:01/12/24<1400&01/15/24`
Date without time assumes the user will be taking the whole day off.

The Program should automaticly remove PTO requests that are older then a week from the current system time.


----TODO----
-Output Generation
 *Parse the file into an array of employee objects
 *filter out PTO requests
 *generate the table
  -select colors from color table depending on index number


-Input Sheet
 *Select User and parse file into readable format
 *Allow editing current user
 *add new PTO Requests
  -Remove ones older then one week of current date when outputing
 *Add new User



Why did they pay me to make this instead of purchasing something else you may ask?
  No clue but I got paid non the less!
