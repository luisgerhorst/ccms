
/**
 *
 * @constructor
 * @param {string} proxyURL Path to the CouchDB proxy.
 * @param {{username: ?string, password: ?string, cookie: ?boolean}} credentials
 *
 */

var CouchDB = function (proxyURL, credentials) {
	
	// Constructors
	
	var Authentication = function (credentials) { // don't log this var
		
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
	
	var Database = function (databaseName) {
		
		var parseError = function (jqXHR) {
			var status = jqXHR.status;
			if (status !== 200 && status !== 201) return {
				code: status,
				message: jqXHR.statusText
			};
			else return false;
		};
		
		var request = function (options, done) {
			
			options.url = proxyURL + '/' + databaseName + '/' + options.document;
			options.document = null;
			options.data = JSON.stringify(options.data);
			
			if (options.type !== 'GET' && options.type !== 'HEAD' && authentication.method === 'usernamepassword') {
				options.beforeSend = function (xhr) {
					xhr.setRequestHeader('Authorization', 'Basic ' + btoa(authentication.username + ':' + authentication.password));
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
		
		if (authentication.admin) {
			
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
	
	var Session = function () {
		
		this.delete = function () {
			
			var options = {
				url: proxyURL + '/_session',
				type: 'DELETE'
			};
			
			$.ajax(options).fail(function (jqXHR, textStatus) {
				console.log('Fail while ' + options.type + ' request to ' + options.url, textStatus, jqXHR);
			});
			
		};
		
		if (authentication.admin && authentication.method === 'usernamepassword') {
			
			this.create = function () {
				
				var options = {
					url: proxyURL + '/_session',
					type: 'POST',
					data: 'name=' + authentication.username + '&password=' + authentication.password,
					contentType: 'application/x-www-form-urlencoded'
				};
				
				$.ajax(options).fail(function (jqXHR, textStatus) {
					console.log('Fail while ' + options.type + ' request to ' + options.url, textStatus, jqXHR);
				});
				
			};
			
		}
		
	};
	
	// Methods
	
	/** @type {{ admin: boolean, method: ?string, username: ?string, password: ?string, cookie: ?boolean }} */
	var authentication = new Authentication(credentials);
	
	this.database = function (databaseName) {
		return new Database(databaseName);
	};
	
	this.session = new Session();
	
}
