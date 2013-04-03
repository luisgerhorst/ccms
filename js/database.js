
/*


To create a read-only database connection. This object does not have the methods 'save' and 'remove'.

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');


To create a database connection with read and write access (for the CMS' admin). If the username and the password aren't accepted by the server, the browser's native HTTP-Auth dialoge will pop up asking the user to enter a valid username or password.

var couchdbAdmin = new CouchDB('/ccms-couchdb-proxy', 'ccms', 'myUsername', 'mySecretPassword');


To make the Browser ask the user for it's HTTP-Auth username and password.

var couchdbAdminWithHTTPAuthPopup = new CouchDB('/ccms-couchdb-proxy', 'ccms', true, true);


*/

var CouchDB = function (proxyPath, database, username, password) {
	
	var editor = false;
	if (typeof username !== 'undefined' && typeof password !== 'undefined') editor = true;

	var request = function (options, done) {
		
		options.url = proxyPath + '/' + database + '/' + options.document;
		options.document = null;
		options.data = JSON.stringify(options.data);
		
		if (editor && options.type !== 'GET' && options.type !== 'HEAD') { // if it's a write access to the db
			options.beforeSend = function (xhr) {
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
			}; // don't know why the jQuery ajax username and password properties don't work instead of this
		}
		
		var ajax = $.ajax(options);
		
		ajax.done(done);
		ajax.fail(function (jqXHR, textStatus, errorThrown) {
			done(null, textStatus, jqXHR);
		});
		
	};
	
	this.read = function (document, callback) {
		
		request({
			document: document,
			type: 'GET'
		}, function (data, textStatus, jqXHR) {
			callback(JSON.parse(data), parseError(jqXHR));
		});
		
	};
	
	this.exists = function (document, callback) {
		
		request({
			document: document,
			type: 'HEAD'
		}, function (oldData, textStatus, jqXHR) {
			
			if (jqXHR.status === 200) callback(jqXHR.getResponseHeader('Etag').replace(/"/g, ''), parseError(jqXHR)); // if file exists
			
			else callback(false, parseError(jqXHR)); // if file doesn't exist
			
		});
		
	};
	
	this.view = function (doc, func, callback) {
		
		request({
			document: '_design/' + doc + '/_view/' + func,
			type: 'GET'
		}, function (data, textStatus, jqXHR) {
			callback(JSON.parse(data), parseError(jqXHR));
		});
		
	};
	
	if (editor) {
		
		this.save = function (document, data, callback) {
			
			request({
				document: document,
				type: 'HEAD'
			}, function (oldData, textStatus, jqXHR) {
				
				var status = jqXHR.status;
				
				if (status === 200) data._rev = jqXHR.getResponseHeader('Etag').replace(/"/g, '');
				
				if (status === 404 || status === 200) {
					
					request({
						document: document,
						type: 'PUT',
						data: data
					}, function (data, textStatus, jqXHR) {
						callback(JSON.parse(data), parseError(jqXHR));
					});
					
				}
				
				else callback(JSON.parse(data), parseError(jqXHR));
				
			});
			
		};
		
		this.remove = function (document, callback) {
			
			request({
				document: document,
				type: 'HEAD',
			}, function (data, textStatus, jqXHR) {
				
				if (jqXHR.status === 200) {
					request({
						document: document + '?rev=' + jqXHR.getResponseHeader('Etag').replace(/"/g, ''),
						type: 'DELETE'
					}, function (data, textStatus, jqXHR) {
						callback(JSON.parse(data), parseError(jqXHR));
					});
				}
				
				else {
					callback(null, parseError(jqXHR));
				}
				
			});
		
		};
		
	}
	
	function parseError(jqXHR) {
		var status = jqXHR.status;
		if (status !== 200 && status !== 201) return {
			code: status,
			message: jqXHR.statusText
		};
		else return false;
	}
	
}
