#!/bin/sh

host="127.0.0.1:5984"

encodeURIComponent () {
	echo "$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$1")" | sed -e "s/%21/!/g" | sed -e "s/%2A/*/g" | sed -e "s/%28/(/g" | sed -e "s/%29/)/g" | sed -e "s/%5C/'/g" # doesn't encode ~!*()'
}

# ensure CouchDB access

code=$(curl --write-out %{http_code} --silent --output /dev/null http://$host/_config/admins)

if [ $code -lt 200 ] || [ $code -ge 300 ]
then

	solved=0
	
	if [ $code -eq 000 ]
	then
		echo Error: Make shure CouchDB is installed and running.
		exit 1
	elif [ $code -eq 401 ]
	then
		echo Admin username and password required to access CouchDB.
		read -p "Username: " adminUsername
		adminUsername="$(encodeURIComponent "$adminUsername")" # sucks!
		read -p "Password: " adminPassword
		adminPassword="$(encodeURIComponent "$adminPassword")"
		code=$(curl --write-out %{http_code} --silent --output /dev/null http://$adminUsername:$adminPassword@$host/_config/admins)
		if [ $code -ge 200 ] && [ $code -lt 300 ]
		then
			echo Credentials valid.
		elif [ $code -eq 401 ] || [ $code -eq 403 ]
		then
			echo Credentials invalid.
			exit 1
		else
			echo Problem with CouchDB HTTP API, request to $adminUsername:$adminPassword@$host/_config/admins returned $code
			exit 1
		fi
	else
		echo Problem with CouchDB HTTP API, request to $host/_config/admins returned $code
		exit 1
	fi
	
fi

# ask username & password

echo Going to create a CouchDB admin account you can use with CCMS.

accountPrefix="ccms/" # check if prefix already taken

read -p "Enter username for your CCMS account [ccms/admin]: $accountPrefix" ccmsUsername

if [ -z $ccmsUsername ]
then
	ccmsUsername="admin"
	echo Username is $accountPrefix\admin
fi

username="$(encodeURIComponent "$accountPrefix$ccmsUsername")" # encode prefix + username

read -p "Enter password: " passwordDecoded # decoded version needed for account creation

password="$(encodeURIComponent "$passwordDecoded")"

# create user

code=$(curl --write-out "%{http_code}" --silent --output /dev/null -X PUT http://$adminUsername:$adminPassword@$host/_config/admins/$username -d '"'$passwordDecoded'"')
if [ $code -lt 200 ] || [ $code -ge 300 ]
then
	echo Problem with CouchDB HTTP API, PUT request to $adminUsername:[password]@$host/_config/admins/$username returned $code
	exit 1
fi

echo Account created, remember these credentials for logging in to CCMS.

# create database

database="ccms"

echo CCMS needs a CouchDB database.

putCode=$(curl --write-out "%{http_code}" --silent --output /dev/null -X PUT http://$username:$password@$host/$database/)
if [ $putCode -lt 200 ] || [ $putCode -ge 300 ]
then
	if [ $putCode -eq 412 ] # db exists
	then
	
		echo "Database with name 'ccms' already exists."
		read -p "Do you want to use 'ccms', overwrite 'ccms', or create a new database? [use/overwrite/create]: " command
		
		if [ "$command" = "use" ]
		then
		
			echo "Going to use database 'ccms'."
			
		elif [ "$command" = "overwrite" ]
		then
		
			echo "Going to overwrite database 'ccms' ..."
			echo "Deleting database 'ccms' ..."
			code=$(curl --write-out "%{http_code}" --silent --output /dev/null -X DELETE http://$username:$password@$host/$database/)
			if [ $code -lt 200 ] || [ $code -ge 300 ]
			then
				echo Problem with CouchDB HTTP API, DELETE request to $username:[password]@$host/$database/ returned $code
				exit 1
			fi
			echo "Creating database 'ccms' ..."
			code=$(curl --write-out "%{http_code}" --silent --output /dev/null -X PUT http://$username:$password@$host/$database/)
			if [ $code -lt 200 ] || [ $code -ge 300 ]
			then
				echo Problem with CouchDB HTTP API, PUT request to $username:[password]@$host/$database/ returned $code
				exit 1
			fi
			echo "Database 'ccms' successfully overwritten."
			
		elif [ "$command" = "create" ]
		then
		
			read -p "Enter database name: " database
			database="$(encodeURIComponent "$database")"
			
			code=$(curl --write-out "%{http_code}" --silent --output /dev/null -X PUT http://$username:$password@$host/$database/)
			if [ $code -lt 200 ] || [ $code -ge 300 ]
			then
				if [ $code -eq 412 ]
				then
					echo "Database with name '$database' already exists."
					exit 1
				else
					echo Problem with CouchDB HTTP API, PUT request to $username:[password]@$host/$database/ returned $code
					exit 1
				fi
			fi
			
			echo Database created.
			
		else
			
			echo No valid input.
			exit 1
			
		fi
		
	else
		
		echo Problem with CouchDB HTTP API, PUT request to $username:[password]@$host/$database/ returned $putCode
		exit 1
		
	fi
	
fi

# configure proxy



# write used account prefix, database name & proxy path into config.json

echo Account Prefix: $accountPrefix Database Name: $database
