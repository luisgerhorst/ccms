function createDatabase(couchdb, name) {
	
	couchdb.createDatabase(name, function (database, error) {
		
		if (!error) saveDocuments(database);
		else if (error.code == 412) notifications.confirm('CouchDB Database with name <code>' + name + '</code> does already exist. Do you wnat to overwrite it?', 'Overwrite', 'Use another database', function (doNotUse) {
			
			if (doNotUse) void(0);
			else notifications.confirm('Are you sure that you want to overwrite the database <code>' + name + '</code>?', 'Use another database', 'Overwrite', function (confirmed) {
					
					if (!confirmed) void(0);
					else {
						
						couchdb.deleteDatabase('ccms', function (error) {
							if (error) notifications.alert('Error occured while deleting the database.');
							else couchdb.createDatabase('ccms', function (database, error) {
								if (!error) saveDocuments(database);
								else notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while creating the database.');
							});
						});
						
					}
					
			});
			
		});
		else notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while creating the database.');
		
	});
	
}