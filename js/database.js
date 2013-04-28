
/*


To create a read-only database connection. This object does not have the methods 'save' and 'remove'.

var couchdb = new CouchDB('/ccms-couchdb-proxy', 'ccms');


To create a database connection with read and write access (for the CMS' admin). If the username and the password aren't accepted by the server, the browser's native HTTP-Auth dialoge will pop up asking the user to enter a valid username or password.

var couchdbAdmin = new CouchDB('/ccms-couchdb-proxy', 'ccms', 'myUsername', 'mySecretPassword');


To make the Browser ask the user for it's HTTP-Auth username and password.

var couchdbAdminWithHTTPAuthPopup = new CouchDB('/ccms-couchdb-proxy', 'ccms', true, true);


*/

/*

Parameter auth:

null

or:

{
	username: String, no
	password: String, no
	cookie: Boolean, no
}

Modified auth:

{
	admin: Boolean
	method: String 'cookie' 'usernamepassword', null
	username: String, null
	password: String, null
	cookie: Boolean, null
}

*/

var CouchDB = function (proxy, credentials) {
	
	var Auth = function (credentials) { // don't log this var
		
		var method;
		if (credentials.cookie) method = 'cookie';
		else if (typeof credentials.username === 'string' && typeof credentials.password === 'string') method = 'usernamepassword';
		
		switch (method) {
			case 'cookie':
				this.admin = true;
				this.method = 'cookie';
				break;
			case 'usernamepassword':
				this.admin = true;
				this.method = 'usernamepassword';
				this.username = credentials.username;
				this.password = credentials.password;
				break;
			default:
				this.admin = false;
		}
		
	};
	
	var auth = new Auth(credentials);
	
	var Database = function (db) {
		
		var parseError = function (jqXHR) {
			var status = jqXHR.status;
			if (status !== 200 && status !== 201) return {
				code: status,
				message: jqXHR.statusText
			};
			else return false;
		};
		
		var request = function (options, done) {
			
			options.url = proxy + '/' + db + '/' + options.document;
			options.document = null;
			options.data = JSON.stringify(options.data);
			
			if (options.type !== 'GET' && options.type !== 'HEAD' && auth.method === 'usernamepassword') {
				options.beforeSend = function (xhr) {
					xhr.setRequestHeader('Authorization', 'Basic ' + btoa(auth.username + ':' + auth.password));
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
		
		if (auth.admin) {
			
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
		
	};
	
	this.database = function (db) {
		return new Database(db);
	};
	
	this.deleteSession = function () {
		
		$.ajax({
			url: proxy + '/_session',
			type: 'DELETE'
		}).done(function (data, textStatus, jqXHR) {
			console.log('Deleted session.');
		}).fail(function (jqXHR, textStatus) {
			console.log(textStatus, jqXHR);
		}); // make CouchDB set a cookie
		
	};
	
	if (auth.admin && auth.method === 'usernamepassword') {
		
		this.createSession = function () {
			
			$.ajax({
				url: proxy + '/_session',
				type: 'POST',
				data: 'name=' + auth.username + '&password=' + auth.password,
				contentType: 'application/x-www-form-urlencoded'
			}).fail(function (jqXHR, textStatus) {
				console.log(textStatus, jqXHR);
			}); // make CouchDB set a cookie
			
		};
		
	}
	
}
