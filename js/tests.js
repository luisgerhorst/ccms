/* Ember.js */



/* CouchDB */

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');

console.log('Test: CouchDB reading (404 expected) ...');

couchdb.read('test', function (response, error) {
	
	if (response === null && error.code === 404) console.log('Success.', response, error);
	else console.log('NO SUCCESS.', response, error);
	
	var adminCouchDB = new CouchDB('/ccms-couchdb-proxy', 'ccms', true, true);
	
	console.log('Test: CouchDB editor saving ...');
	
	adminCouchDB.save('test', {
		hello: 'world'
	}, function (response, error) {
		
		if (error === false && response.ok === true) console.log('Success.', response, error);
		else console.log('NO SUCCESS.', response, error);
		
		console.log('Test: CouchDB editor replacing ...');
	
		adminCouchDB.save('test', {
			hi: 'world'
		}, function (response, error) {
			
			if (error === false && response.ok === true) console.log('Success.', response, error);
			else console.log('NO SUCCESS.', response, error);
			
			console.log('Test: CouchDB editor reading ...');
	
			adminCouchDB.read('test', function (response, error) {
				
				if (error === false && response.hi == 'world') console.log('Success.', response, error);
				else console.log('NO SUCCESS.', response, error);
				
				console.log('Test: CouchDB editor deleting ...');
	
				adminCouchDB.remove('test', function (response, error) {
					
					if (error === false && response.ok === true) console.log('Success.', response, error);
					else console.log('NO SUCCESS.', response, error);
					
					console.log('Test: CouchDB editor deleting (404 expected) ...');
					
					adminCouchDB.remove('test', function (response, error) {
						
						if (response === null && error.code === 404) console.log('Success.', response, error);
						else console.log('NO SUCCESS.', response, error);
						
						console.log('Test complete: CouchDB');
						
					});
					
				});
	
			});
	
		});
	
	});
	
});
