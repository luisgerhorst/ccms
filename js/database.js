
/** @param {string} proxyURL Path to the CouchDB proxy. */

var CouchDB = function (proxyURL) {
	
	// Data Constructors
	
	var Credentials = function (credentials) { // don't log this var
	
		/** @type {!Object} */
		credentials = typeof credentials === 'object' ? credentials !== null ? credentials : {} : {};
		
		this.cookie = credentials.cookie ? true : false;
		this.username = credentials.username || false;
		this.password = credentials.password || false;
		
	};
	
	// Vars
	
	var credentials = new Credentials(null);
	
	// Utilities
	
	var parseError = function (jqXHR) {
		var status = jqXHR.status;
		if (status !== 200 && status !== 201) return {
			code: status,
			message: jqXHR.statusText
		};
		else return false;
	};
	
	// Constructors
	
	var Database = function (databaseName) {
		
		var request = function (options, done) {
			
			options.url = proxyURL + '/' + databaseName + '/' + options.document;
			options.document = null;
			options.data = JSON.stringify(options.data);
			
			if (options.type !== 'GET' && options.type !== 'HEAD' && !credentials.cookie && credentials.username && credentials.password) {
				options.beforeSend = function (xhr) {
					xhr.setRequestHeader('Authorization', 'Basic ' + btoa(credentials.username + ':' + credentials.password));
				};
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
			
		this.save = function (document, data, callback) {
			
			request({
				document: document,
				type: 'HEAD'
			}, function (headResponse, textStatus, jqXHR) {
				
				var status = jqXHR.status;
				data._rev = status === 200 ? jqXHR.getResponseHeader('Etag').replace(/"/g, '') : undefined;
				
				if (status === 404 || status === 200) {
					
					request({
						document: document,
						type: 'PUT',
						data: data
					}, function (data, textStatus, jqXHR) {
						callback(JSON.parse(data), parseError(jqXHR));
					});
					
				}
				
				else callback(null, parseError(jqXHR));
				
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
				
				else callback(null, parseError(jqXHR));
				
			});
		
		};
		
	};
	
	var Session = function () {
		
		this.start = function () {
				
			if (credentials.username && credentials.password) {
				
				var options = {
					url: proxyURL + '/_session',
					type: 'POST',
					data: 'name=' + credentials.username + '&password=' + credentials.password,
					contentType: 'application/x-www-form-urlencoded'
				};
				
				var ajax = $.ajax(options);
				
				ajax.fail(function (jqXHR, textStatus) {
					console.log('Fail while ' + options.type + ' request to ' + options.url, textStatus, jqXHR);
				});
				
				ajax.done(function () {
					credentials.cookie = true;
				});
				
			}
				
		};
		
		this.end = function () {
			
			var options = {
				url: proxyURL + '/_session',
				type: 'DELETE'
			};
			
			var ajax = $.ajax(options);
			
			ajax.fail(function (jqXHR, textStatus) {
				console.log('Fail while ' + options.type + ' request to ' + options.url, textStatus, jqXHR);
			});
			
			ajax.done(function () {
				credentials.cookie = false;
			});
			
		};
		
	};
	
	var Authorization = function () {
		
		this.add = function (object) {
			
			credentials = new Credentials(object);
			
		};
		
		this.remove = function () {
			
			credentials = new Credentials(null);
			
		};
		
	};
	
	// Methods
	
	this.session = new Session();
	
	this.authorization = new Authorization();
	
	this.database = function (databaseName) {
		
		return new Database(databaseName);
		
	};
	
}
