
/** @param {string} proxy Path to the CouchDB proxy. */

var CouchDB = function (proxy) {
	
	$.ajaxSetup({
		timeout: 15000
	});
	
	var CouchDB = this;
	
	// Data Constructors
	
	var Credentials = function (credentials) {
	
		credentials = credentials ? credentials : {}; // if called with null
		
		this.cookie = credentials.cookie ? true : false;
		this.username = typeof credentials.username === 'string' ? credentials.username : false;
		this.password = typeof credentials.password === 'string' ? credentials.password : false;
		
	};
	
	// Vars
	
	var credentials = new Credentials(null);
	
	// Utils
	
	function parseError(jqXHR) {
		
		var code = jqXHR.status;
		
		if (code != 200 && code != 201) return {
			code: code,
			message: jqXHR.statusText,
			jqXHR: jqXHR
		};
		
		else return false;
		
	}
	
	// Methods
	
	CouchDB.authorize = function (object) {
		
		credentials = new Credentials(object);
		
		return CouchDB;
		
	};
	
	CouchDB.deauthorize = function () {
		
		credentials = new Credentials(null);
		
		return CouchDB;
		
	};
	
	CouchDB.remember = function (callback) {
		
		if (credentials.username && credentials.password) $.ajax({
			url: proxy + '/_session/',
			type: 'POST',
			data: 'name=' +  encodeURIComponent(credentials.username) + '&password=' +  encodeURIComponent(credentials.password),
			contentType: 'application/x-www-form-urlencoded',
			error: function (jqXHR, textStatus) {
				console.log('Error "' + textStatus + '" occured while ' + options.type + ' request to ' + options.url, jqXHR);
				if (callback) callback(parseError(jqXHR));
			},
			success: function () {
				
				console.log('db-remember-success');
				credentials.cookie = true;
				if (callback) callback(false);
			}
		});
		
		return CouchDB;
			
	};
	
	CouchDB.forget = function (callback) {
		
		$.ajax({
			url: proxy + '/_session/',
			type: 'DELETE',
			error: function (jqXHR, textStatus) {
				console.log('Error "' + textStatus + '" occured while ' + options.type + ' request to ' + options.url, jqXHR);
				if (callback) callback(parseError(jqXHR));
			},
			success: function () {
				credentials.cookie = false;
				if (callback) callback(false);
			}
		});
		
		return CouchDB;
		
	};
	
	CouchDB.Database = function (databaseName) {
		
		var Database = this;
		
		function AjaxOptions(options, complete) {
			
			var documentPath = options.document ? options.document : '';
			
			this.type = options.type || 'GET';
			this.url = proxy + '/' + databaseName + '/' + documentPath;
			this.data = JSON.stringify(options.data) || undefined;
			this.contentType = this.data ? 'application/json' : undefined;
			
			if (!credentials.cookie && credentials.username && credentials.password && this.type !== 'HEAD' && this.type !== 'GET') this.headers = { // important: only use if no cookie is set
				Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
			};
			
			
			this.success = function (data, textStatus, jqXHR) {
				complete(data, jqXHR);
			};
			
			this.error = function (jqXHR, textStatus, errorThrown) {
				complete(null, jqXHR);
			};
			
		}
		
		function request(options, complete) {
			
			$.ajax(new AjaxOptions(options, complete));
			
		}
		
		Database.read = function (document, callback) {
			
			request({
				document: document
			}, function (data, jqXHR) {
				callback(JSON.parse(data), parseError(jqXHR));
			});
			
			return Database;
			
		};
		
		Database.exists = function (document, callback) {
			
			request({
				document: document,
				type: 'HEAD'
			}, function (data, jqXHR) {
				if (jqXHR.status === 200) callback(jqXHR.getResponseHeader('Etag').replace(/"/g, ''), parseError(jqXHR)); // if file exists
				else callback(false, parseError(jqXHR)); // if file doesn't exist
			});
			
			return Database;
			
		};
		
		Database.view = function (doc, func, callback) {
			
			request({
				document: '_design/' + doc + '/_view/' + func
			}, function (data, jqXHR) {
				callback(JSON.parse(data), parseError(jqXHR));
			});
			
			return Database;
			
		};
			
		Database.save = function (parameterOne, parameterTwo, parameterThree) {
			
			var put = function () {
				
				var document = parameterOne, data = parameterTwo, callback = parameterThree;
				
				request({
					document: document,
					type: 'HEAD'
				}, function (headResponse, jqXHR) {
					
					var status = jqXHR.status;
					
					data._rev = status == 200 ? jqXHR.getResponseHeader('Etag').replace(/"/g, '') : undefined;
					
					if (status == 404 || status == 200) {
						
						request({
							document: document,
							type: 'PUT',
							data: data
						}, function (data, jqXHR) {
							callback(JSON.parse(data), parseError(jqXHR));
						});
						
					}
					
					else callback(null, parseError(jqXHR));
					
				});
				
			};
			
			var post = function () {
				
				var data = parameterOne, callback = parameterTwo;
				
				request({
					type: 'POST',
					data: data
				}, function (data, jqXHR) {
					callback(JSON.parse(data), parseError(jqXHR));
				});
				
			};
			
			if (typeof parameterOne === 'string') put();
			else post();
			
			return Database;
				
		};
			
		Database.remove = function (document, callback) {
			
			request({
				document: document,
				type: 'HEAD',
			}, function (data, jqXHR) {
				
				if (jqXHR.status == 200) {
					request({
						document: document + '?rev=' + jqXHR.getResponseHeader('Etag').replace(/"/g, ''),
						type: 'DELETE'
					}, function (data, jqXHR) {
						callback(JSON.parse(data), parseError(jqXHR));
					});
				}
				
				else callback(null, parseError(jqXHR));
				
			});
			
			return Database;
		
		};
		
	};
	
	CouchDB.createDatabase = function (name, callback) {
		
		var options = {
			url: proxy + '/' + name + '/',
			type: 'PUT',
			error: function (jqXHR, textStatus, errorThrown) {
				callback(null, parseError(jqXHR));
			},
			success: function (data, textStatus, jqXHR) {
				callback(new CouchDB.Database(name), false);
			}
		};
		
		if (!credentials.cookie && credentials.username && credentials.password) options.headers = { // important: only use if no cookie is set
			Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
		};
		
		$.ajax(options);
		
		return CouchDB;
		
	};
	
	CouchDB.deleteDatabase = function (name, callback) {
		
		var options = {
			url: proxy + '/' + name + '/',
			type: 'DELETE',
			error: function (jqXHR, textStatus, errorThrown) {
				console.log('Error "' + textStatus + '" occured while ' + this.type + ' request to ' + this.url, jqXHR);
				callback(parseError(jqXHR));
			},
			success: function (data, textStatus, jqXHR) {
				callback(false);
			}
		};
		
		if (!credentials.cookie && credentials.username && credentials.password) options.headers = { // important: only use if no cookie is set
			Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
		};
		
		$.ajax(options);
		
		return CouchDB;
		
	};
	
	CouchDB.getAdmins = function (callback) {
		
		var options = {
			url: proxy + '/_config/admins/',
			type: 'GET',
			error: function (jqXHR, textStatus, errorThrown) {
				callback(null, parseError(jqXHR));
			},
			success: function (data, textStatus, jqXHR) {
				callback(data, false);
			}
		};
		
		if (!credentials.cookie && credentials.username && credentials.password) options.headers = { // important: only use if no cookie is set
			Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
		};
		
		$.ajax(options);
		
		return CouchDB;
	
	};

	CouchDB.createAdmin = function (name, password, callback) {
		
		var options = {
			url: proxy + '/_config/admins/' + name,
			type: 'PUT',
			data: '"' + password + '"',
			error: function (jqXHR, textStatus, errorThrown) {
				console.log('Error "' + textStatus + '" occured while ' + this.type + ' request to ' + this.url, jqXHR);
				callback(parseError(jqXHR));
			},
			success: function (data, textStatus, jqXHR) {
				callback(false);
			}
		};
		
		if (!credentials.cookie && credentials.username && credentials.password) options.headers = { // important: only use if no cookie is set
			Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
		};
		
		$.ajax(options);
		
		return CouchDB;

	};

	CouchDB.deleteAdmin = function (name, callback) {

		var options = {
			url: proxy + '/_config/admins/' + name,
			type: 'DELETE',
			error: function (jqXHR, textStatus, errorThrown) {
				console.log('Error "' + textStatus + '" occured while ' + this.type + ' request to ' + this.url, jqXHR);
				callback(parseError(jqXHR));
			},
			success: function (data, textStatus, jqXHR) {
				callback(false);
			}
		};
		
		if (!credentials.cookie && credentials.username && credentials.password) options.headers = { // important: only use if no cookie is set
			Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
		};
		
		$.ajax(options);
		
		return CouchDB;

	};
	
}
