/* CouchDB Web Client */

var CouchDB = function (proxyPath, database, username, password) {
	
	var editor = false;
	if (typeof username !== 'undefined' && typeof password !== 'undefined') editor = true;

	var request = function (document, method, callback, data) {
		
		// setting defaults if undefined
		if (typeof callback === 'undefined') callback = function (response) {};
		if (typeof data === 'undefined') data = '';
		
		// ajax request options
		var options = {
			type: method,
			url: proxyPath + '/' + database + '/' + document,
			data: data
		};
		
		if (editor) {
			options.username = username;
			options.password = password;
		}
		
		// callback
		var done = function (msg) {
			console.log('Received response.', msg);
			callback(msg);
		};
		
		console.log(options);
		
		// send
		$.ajax(options).done(done);
		
		// log
		console.log('Sent ' + options.type + ' request to ' + options.url + ' ...');
		
	};
	
	this.read = function (document, callback) {
		request(document, 'GET', callback);
	};
	
	this.view = function (doc, func, callback) {
		request(database + '_design/' + doc + '/_view/' + func, 'GET', callback);
	};
	
	if (editor) {
		
		this.save = function (document, data, callback) {
			request(document, 'PUT', callback, data);
		};
		
	}
	
}

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');

couchdb.read('meta', function (response) {
	console.log(response);
});

var adminCouchDB = new CouchDB('/ccms-couchdb-proxy', 'ccms', 'admin', 'samplePassword');

adminCouchDB.save('meta2', { hello: 'string' }, function (response) {
	console.log(response);
});
