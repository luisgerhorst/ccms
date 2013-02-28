var couchdb;

$.ajax({
	url: 'config.json'
}).done(function (data) {
	console.log('Received configuration.', data);
	couchdb = new CouchDB(data.couchdbProxy, data.database);
	render();
});