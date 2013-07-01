#!/bin/sh

# grep -Po '"text":.*?[^\\]",'
# parse json?

host="http://127.0.0.1:5984"

testResponseCode=$(curl --write-out %{http_code} --silent --output /dev/null $host/_config/admins)

if [ $testResponseCode -lt 200 ] || [ $testResponseCode -ge 300 ]
then
	echo Problem with CouchDB HTTP API, request to $host/_config/admins returned $testResponseCode
	exit 1
fi

echo Going to create a CouchDB admin account you can use with CCMS.

read -p "Continue (y/no): " continue
if [[ $continue =~ ^no$ ]]
then
	exit 1
fi

read -p "Enter username for your CCMS account: " username
read -p "Enter password: " password

curl -X PUT $host/_config/admins/$username -d '"$password"'

# echo Account created, remember the credentials for logging in to CCMS later.