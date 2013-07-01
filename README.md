# CCMS

CCMS is a Content-Management-System for blogs, it doesn't require any custom backend (such as PHP, Ruby on Rails or node.js). This is possible by using [CouchDB](http://couchdb.apache.org)'s HTTP API. Another important feature is that the site dynamically loads required contents from the database using JavaScript. This means there's no reload while navigating on the blog.
	
CCMS is currently in early **ALPHA**. If you anyway want to try it just [send me a mail](mailto:luis@luisgerhorst.de) and I'll help you with the installation. Thanks!

# Installation

Just open `/install.html` in your browser and follow the instructions.

# Configure Server Manually

This is for pro users who don't want to use `install.sh` to configure their server. You need good knowledge about Apache and CouchDB.

## CouchDB

First you have to create a admin account for CCMS. For the beginning, create an account named `ccms/admin`.

Create a database named `ccms`. Add the user `ccms/admin` to the  database's admins (very important, otherwise everyone can edit the database).

## Apache

Because of the browser's [Same-Origin-Policy](http://de.wikipedia.org/wiki/Same-Origin-Policy), the JavaScript running at the client can't diretly access the [CouchDB HTTP API](http://wiki.apache.org/couchdb/HTTP_Document_API). This is a tutorial how to set up a proxy to redirect the requests to a specified path to your CouchDB using Apache.

Open your Apache's `httpd.conf` file with a text editor.

Make shure the line `LoadModule proxy_module modules/mod_proxy.so` isn't commented out with a `#`.

Add this to the file.

```
# Turns on the proxy module
ProxyRequests On
# Redirects requests to the database
ProxyPass /couchdb/ccms http://127.0.0.1:5984/ccms
# Redirects requests to the CouchDB Session API
ProxyPass /couchdb/_session http://127.0.0.1:5984/_session
```

Save the file and restart Apache.

**Test:**

Open `http://yourdomain.com/couchdb/ccms` in your browser. You should see some basic information about the database (in JSON format).

## config.json

This file contains some basic information about the configuration of your server. If you haven't change the values used in this tutorial you can skip this chapter.

`proxy`: The first part of the path you used for Apache's CouchDB proxy, default is `/couchdb`.

`accountPrefix`: The prefix you want to use for CouchDB accounts used by CCMS, when you log in to CCMS you only have to enter everything after this prefix. Means, when you create an CouchDB account named `ccms/admin`, you can login to it using CCMS by entering the username `admin`. The default prefix is `ccms/`.

`database`: Name of the CouchDB database you created for CCMS, default is `ccms`.

# Done

Your server is ready now, you can go back /install.html and click "Server is ready".