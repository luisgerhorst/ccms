/* CouchDB */

/*

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');

couchdb.read('meta', function (response) {
	console.log(response);
});

*/

var adminCouchDB = new CouchDB('/ccms-couchdb-proxy', 'ccms', 'admin', 'samplePassword');

adminCouchDB.save('meta2', { hello: 'string' }, function (response) {
	console.log('CouchDB.save callback parameter called.', response);
});
