# CouchDB Configuration

1. Install CouchDB on [Mac, Windows, download the Source](http://couchdb.apache.org/#download) or on [Ubuntu, FreeBSD, etc.](http://wiki.apache.org/couchdb/Installation)

2. Create an admin account, you can use "admin" as username.

3. Create a database for CCMS.

4. Add the admin account to the DB's "Admins" and leave the Members empty (Means you have to be a admin now to modify this database, but **everyone** on the internet is allowed to read. [Screenshot](http://cl.ly/O7SK). You must also make sure you now **always** add at least one user to the "Admins" section (otherwise everybody on the internet will be allowed to write into you DB!) and one user to the "Members" section to make the database only edit-/readable by your own server/people who have the password for this user.

5. Go to "Configuration" in the Admin Console and change httpd -> bind_address to "0.0.0.0". Now your CouchDB is accessable by everybody on the Internet.