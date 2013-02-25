/* CouchDB */

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms', false, false);

couchdb.read('test', function (response, error) {
	
	console.log('TEST: CouchDB reading (404 expected).', response, error);
	
	var adminCouchDB = new CouchDB('/ccms-couchdb-proxy', 'ccms', false, true);
	
	adminCouchDB.save('test', {
		hello: 'world'
	}, function (response, error) {
	
		console.log('TEST: CouchDB editor saving.', response, error);
	
		adminCouchDB.save('test', {
			hi: 'world'
		}, function (response) {
			
			console.log('TEST: CouchDB editor updating.', response);
	
			adminCouchDB.read('test', function (response) {
				
				console.log('TEST: CouchDB editor reading.', response);
	
				adminCouchDB.remove('test', function (response) {
					
					console.log('TEST: CouchDB editor deleting.', response);
					
					adminCouchDB.remove('test', function (response, error) {
						
						console.log('TEST: CouchDB editor deleting (404 expected).', response, error);
						
						console.log('TEST COMPLETE: CouchDB');
						
					});
					
				});
	
			});
	
		});
	
	});
	
});
