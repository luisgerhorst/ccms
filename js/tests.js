/* CouchDB */

/*

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');

couchdb.read('meta', function (response) {
	console.log(response);
});

*/

var adminCouchDB = new CouchDB('/ccms-couchdb-proxy', 'ccms', 'admin', 'samplePassword');

adminCouchDB.save('meta4', {
	hello: 'newstring'
}, function (response) {
	console.log('CouchDB.save callback called.', response);
});

adminCouchDB.read('meta4', function (response) {
	console.log('CouchDB.save callback called.', response);
});
