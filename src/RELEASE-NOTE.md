# Version 5.5.0 Release Note
- remove amount validation in invoice creation
- display reservation's original check-in/check-out date in room move table
- include reservations till check-out date in pookie room list
- check out date calculation: check-out date will not be increased for departure time until 1PM
e.g. 
Departure Date/Time: 2026-03-27 12:59PM => Check Out Date: 2026-03-26
Departure Date/Time: 2026-03-27 01:00PM => Check Out Date: 2026-03-27