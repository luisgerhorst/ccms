$.ajax({
	url: 'config.json'
}).done(function (data) {
	// console.log('Received configuration.', data);
	var couchdb = new CouchDB(data.couchdbProxy, data.database);
	render(couchdb);
});