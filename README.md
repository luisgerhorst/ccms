# CCMS

CCMS is a Content-Management-System for blogs, it doesn't require any custom backend (such as PHP, Ruby on Rails or node.js). This is possible by using [CouchDB](http://couchdb.apache.org)'s HTTP API. Another important feature is that the site dynamically loads required contents from the database using JavaScript. This means there's no reload while navigating on the blog.
	
CCMS is currently in **BETA**.

# Installation

Just open `/install.html` in your browser and follow the instructions. If you've got any problems feel free to send me a [mail](mailto:luis@luisgerhorst.de).

## Help

If you have a problem with one step of the install guide this may help.

### (How to change the database used by CCMS?)(#change-database)

If you already have a CouchDB database named `ccms`, change the `database` field in `etc/config.json`. Otherwise CCMS will offer you to overwrite and **delete** all documents in the existing database.

You also have to change your proxy configuration. If you open `/install.html#/proxy`, after having changed `etc/config.json`, you'll see an updated version of the code you have to add to XAMPP's `httpd.conf`. Replace the old lines by the new ones. Don't forget to restart XAMPP.

### How to change the proxy path?

If you're already running something under `/couchdb`, it's recommended to change the `proxy` field in `etc/config.json`.

You also have to change your proxy configuration. If you open `/install.html#/proxy`, after having changed `etc/config.json`, you'll see an updated version of the code you have to add to XAMPP's `httpd.conf`. Replace the old lines by the new ones. Don't forget to restart XAMPP.