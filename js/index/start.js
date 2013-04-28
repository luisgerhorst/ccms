$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (response) {

		config = response;
		couchdb = new CouchDB(config.couchdbProxy);
		database = couchdb.database(config.database);

		database.read('meta', function (response, error) {

			if (error) console.log('Error while loading document "meta".', error);
			
			else {
				meta = response;
				render();
				routes();
			}

		});

	});

});