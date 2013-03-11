$(document).ready(function () {
	
	$.ajax({
		url: 'config.json'
	}).done(function (data) {
		// console.log('Received configuration.', data);
		var couchdb = new CouchDB(data.couchdbProxy, data.database);
		couchdb.read('meta', function (response, error) {
			if (error) console.log('Error while loading document "meta".', error);
			var template = new Template();
			defineTemplates(couchdb, template, response);
			return;
		});
	});
	
	function defineTemplates(couchdb, template, meta) {
		
		var index = new (template.Page)('/', function (callback) {
			var data = {};
			callback(data);
		});
		
	}
	
});