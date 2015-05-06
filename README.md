A Dash.app docset for Grails
------------------------------

###Updated for Grails 2.3.11

Currently only really works for creation of "Command" items and uses a static single.html within snapshots folder

to use a newer version of grails doc you can just open 

http://grails.org/doc/latest/guide/single.html in chrome and do file save as...
then save it in the snapshots folder as grails_single.html

Still a bit of a work in progress but currently usable.


To build it locally you will need nodejs and grunt...

currently can build by running
	grunt clean
followed by 
	grunt

Still trying to figure out a good way to tie it in with the actual grails doc build 
as I couldn't get that build locally anyway it may be a little while off... 

To use a pre-built version, import *grails.docset* into Dash.

Forked from: https://github.com/dawogfather/grails-dash-docset

cheers to @gilmoreorless and his https://github.com/gilmoreorless/express-dash-docset for getting me down this path 
