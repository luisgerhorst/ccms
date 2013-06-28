#!/bin/sh

# curl -X PUT http://localhost:5984/_config/admins/$username -d '"$password"' # create a CouchDB admin account

# grep -Po '"text":.*?[^\\]",'
# parse json?

echo Enter username for your CCMS admin account:
read username

echo Enter password for your CCMS admin account:
read password

curl -X PUT http://localhost:5984/_config/admins/ccms/$username -d '"$password"' # create a CouchDB admin account