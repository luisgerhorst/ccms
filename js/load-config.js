$.ajax({
	url: 'config.json'
}).done(function (data) {
	// console.log('Received configuration.', data);
	var couchdb = new CouchDB(data.couchdbProxy, data.database);
	couchdb.read('meta', function (response, error) {
		if (error) console.log('Error while loading document "meta".', error);
		console.log(response);
		render(couchdb, response);
	});
});