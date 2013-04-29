$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (response) {
		config = response;
		couchdb = new CouchDB(config.couchdbProxy);
		login();
	});

});