# CCMS

CCMS is a Content-Management-System for blogs that doesn't require any custom backend (such as PHP, Ruby on Rails or node.js). This is possible by using [CouchDB](http://couchdb.apache.org)'s HTTP API. Another important feature is that the site dynamically loads required contents from the database using JavaScript. This means there's no reload while navigating on the blog.
	
CCMS is in **very very early ALPHA**. If you anyway want to try it just [send me a mail](mailto:luis@luisgerhorst.de) and I'll help you. Thanks!

# Configuration

### CouchDB

1. Install CouchDB on [Mac, Windows, download the Source](http://couchdb.apache.org/#download) or on [Ubuntu, FreeBSD, etc.](http://wiki.apache.org/couchdb/Installation)

2. Create an admin account, you can use "admin" as username.

3. Create a database for CCMS (you can use "ccms" as name).

4. Add the admin account to the Database's "Admins" and leave the Members empty. Means you have to be a admin now to modify this database, but *everyone* on the internet is allowed to read. [Screenshot](http://cl.ly/O7SK). You must also make sure you now *always* add at least one user to the "Admins" section (otherwise everybody on the internet will be allowed to write into you DB!) and one user to the "Members" section to make the database only edit-/readable by your own server/people who have the password for this user.

5. Go to "Configuration" in the CouchDB Admin Console and change httpd -> bind_address to "0.0.0.0". Now your CouchDB is accessable by everybody on the Internet.

**Tests:**

*Important:* Make shure you use a different browser where you never logged in to CouchDB before while performing these tests, otherwise there could be some cookie-hassle.

Open ´http://youdomain.com:5984/ccms´. You should see some basic info about the database (if the browser asks you for username and password read step 4 again).

Open ´http://youdomain.com:5984/_utils/config.html´. The browser should ask you for username and password.

### Apache

Because of the browser's [Same-Origin-Policy](http://de.wikipedia.org/wiki/Same-Origin-Policy), the JavaScript running at the client can't diretly access the [CouchDB HTTP API](http://wiki.apache.org/couchdb/HTTP_Document_API). This is a tutorial how to set up a proxy to redirect the requests to a specified path of domain you're running CCMS on to your CouchDB using Apache.

If you're using another web server check it's documentation for "proxy".

1. Open your Apache's ´httpd.conf´ file with a text editor. If you're for example using LAMPP, it's located at ´/opt/lampp/etc/httpd.conf´.

2. Make shure the line ´LoadModule proxy_module modules/mod_proxy.so´ isn't commented out with a ´	#´. If so, remove the ´# ´.

3. Turn on the proxy module by adding ´ProxyRequests On´ to the end of the file.

4. Specify the proxy's path and the CouchDB requests should be redirected to. Add this to the end of the file.

	ProxyPass /ccms-couchdb-proxy http://server:5984

	Replace `server` with the IP address/Domain of the machine your CouchDB is running on.

	**Optional:**

	`/ccms-couchdb-proxy`: The proxy's path. If you've already used this path for another thing, change it.

	`5984`: The port CouchDB is listening on, if you haven't changed the default value in your CouchDB configuration, don't edit this.

5. Save the edited file and restart Apache.

**Tests:**

Open `http://yourdomain.com/ccms-couchdb-proxy`. You should see something such as `{"couchdb":"Welcome","version":"1.2.2"}`.

### config.json

So the clients know where the database is. Edit this file and enter your information.

`couchdbProxy`: Path to the (Apache) proxy for your CouchDB.
`database`: Name of the database you created for CCMS.

### Done?

Open `/install.html` and set up you database! You have to enter your CouchDB's account's username and password.

After being redirected to `/admin.html` you can start blogging.