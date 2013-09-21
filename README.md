# CCMS

CCMS is a Content-Management-System for blogs, it doesn't require any custom backend (such as PHP, Ruby on Rails or node.js). This is possible by using [CouchDB](http://couchdb.apache.org)'s HTTP API. Another important feature is that the site dynamically loads required contents from the database using JavaScript. This means there's no reload while navigating on the blog (and with `history.pushstate`, the URLs are nice anyway).
	
CCMS is currently in **BETA**.

# Installation

Just open `install-config.html` in your browser and follow the instructions. If you've got any problems feel free to send me a [mail](mailto:luis@luisgerhorst.de).

## Help

If you have a problem with one step of the install guide this may help.

### How to change the database used by CCMS?

If you already have a CouchDB database named `ccms`, change the `database` field in `config.json`. Otherwise CCMS will offer you to overwrite  the existing database.

Afterwards, open `install-htaccess.html` in your browser and copy the new code into the `.htaccess` file in the CCMS root directory.

### Installing in a subdirectory

Open `config.json` and change `root`, don't enter a slash at the end.