A Dash.app docset for Grails
------------------------------

currently only really works for creation of "Command" items and uses a static single.html within snapshots folder

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

just wanna use this docset in it's first cut state? 
download the docset from the releases tab... 

cheers to gilmoreorless and his express-dash-docset for getting me down this path 