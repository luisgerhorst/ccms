#!/bin/sh

host="http://127.0.0.1:5984"
accountPrefix="ccms/"

# trying out CouchDB HTTP API

testCode=$(curl --write-out %{http_code} --silent --output /dev/null $host/_config/admins)

if [ $testCode -lt 200 ] || [ $testCode -ge 300 ]
then

	echo Problem with CouchDB HTTP API, request to $host/_config/admins returned $testCode
	
	if [ $testCode -eq 000 ]
	then
		echo Make shure CouchDB is installed and running.
	fi
	
	exit 1
	
fi

# Get username & password for the account

read -p "Going to create a CouchDB admin account you can use with CCMS. Press enter to continue."

read -p "Enter username for your CCMS account [admin]: " username

if [ $username -z ]
then
	username=admin
fi

fullUsername="$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$accountPrefix$username")" # encode username & prefix

read -p "Enter password: " password

# Create account

createAdminCode=$(curl --write-out "%{http_code}" --silent --output /dev/null -X PUT $host/_config/admins/$fullUsername -d '"'$password'"')

if [ $createAdminCode -lt 200 ] || [ $createAdminCode -ge 300 ]
then
	echo Problem with CouchDB HTTP API, PUT request to $host/_config/admins/ccms/$username returned $createAdminCode
	exit 1
fi

echo Account created, remember these credentials for logging in to CCMS.

# Next:
# Create Database
# Configure proxy
# write used account prefix, database name & proxy path into config.json