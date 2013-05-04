# CCMS

CCMS is a Content-Management-System for blogs that doesn't require any custom backend (such as PHP, Ruby on Rails or node.js). This is possible by using [CouchDB](http://couchdb.apache.org)'s HTTP API. Another important feature is that the site dynamically loads required contents from the database using JavaScript. This means there's no reload while navigating on the blog.
	
CCMS is in very very early **ALPHA**. If you anyway want to try it just [send me a mail](mailto:luis@luisgerhorst.de) and I'll help you. Thanks!

# Installation

You first have to add some special configurations to your server. Maybe I'll add a shell script that does all that for you, someday.

## CouchDB

Install CouchDB on [Mac, Windows, download the Source](http://couchdb.apache.org/#download) or on [Ubuntu, FreeBSD, etc.](http://wiki.apache.org/couchdb/Installation)

First you have to create a admin for CCMS. Because of security reasons, all CouchDB accounts used by CCMS *must* begin with `ccms/`, after the `/`, the actual username you'll have to use to log in to the CCMS admin panel begins. For the beginning, now create an account named `ccms/admin`.

Create a database named `ccms`. Add the user `ccms/admin` to the  database's Admins (very important, otherwiese everyone can edit the database).

## Apache

Because of the browser's [Same-Origin-Policy](http://de.wikipedia.org/wiki/Same-Origin-Policy), the JavaScript running at the client can't diretly access the [CouchDB HTTP API](http://wiki.apache.org/couchdb/HTTP_Document_API). This is a tutorial how to set up a proxy to redirect the requests to a specified path of domain you're running CCMS on to your CouchDB using Apache.

Open your Apache's `httpd.conf` file with a text editor. If you're for example using LAMPP, it's located at `/opt/lampp/etc/httpd.conf`.

Make shure the line `LoadModule proxy_module modules/mod_proxy.so` isn't commented out with a `	#`. If so, remove the `# `.

Now, let's configure the proxy by adding this to the file.

```
# Turns on the proxy module
ProxyRequests On
# Redirects requests to the database
ProxyPass /couchdb/ccms http://127.0.0.1:5984/ccms
# Redirects requests to the CouchDB Session API
ProxyPass /couchdb/_session http://127.0.0.1:5984/_session
```

Save the file and restart Apache.

**Tests:**

Open `http://yourdomain.com/couchdb/ccms`. You should see some basic info about the database (in JSON format).

## config.json

So the clients know where the database is. Edit this file and enter your information.

`couchdbProxy`: The first part of the path you used for Apache's proxy for CouchDB, default is `/couchdb`.

`database`: Name of the database you created for CCMS, default is `ccms`.

## Database

Open `/install.html` and set up you database! You have to enter the credentials of the CouchDB account for CCMS (if the user is named `ccms/admin`, enter `admin` as username).

After being redirected to `/admin.html` you can start blogging.