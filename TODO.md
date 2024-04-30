## TODO
 
* BUG - Employee End dates are not functioning as expected and seem to be rolling off a day early.

* Finish reimplementation

* Massive code refactor
  - Split code into interface based and pure parsers 
      * for possible react rewrite
  - Gut remaining CSV code
  - Rework the way data based calls are made and move away from referencing shared objects

* Interface rework
  - Evaluate move to React framework
  - Redesign interface 
    * Create a color scheme and layout rules
    * rethink editing pane
  - Shift 'Groups'
    * Should be able to seperate employees in most if not all panes
    * Potentialy put the group selector at the top of the screen

* Temporary shift (reverse pto)

* Reimplement offline functionality
  - Be able to generate an empty file from scratch

* SECURITY
  - More secure super user storage method
  - CORS config

* Properly render multiple shifts per day

* Server automatic setup