
/** @param {string} proxyURL Path to the CouchDB proxy. */

var CouchDB = function (proxyURL) {
	
	// Data Constructors
	
	var Credentials = function (credentials) {
	
		/** @type {!Object} */
		credentials = credentials ? credentials : {};
		
		this.cookie = credentials.cookie ? true : false;
		this.username = typeof credentials.username === 'string' ? credentials.username : false;
		this.password = typeof credentials.password === 'string' ? credentials.password : false;
		
	};
	
	// Vars
	
	var credentials = new Credentials(null);
	
	// Utilities
	
	var parseError = function (jqXHR) {
		
		var code = jqXHR.status;
		
		if (code !== 200 && code !== 201) return {
			code: code,
			message: jqXHR.statusText,
			jqXHR: jqXHR
		};
		
		else return false;
	};
	
	// Methods
	
	this.authorize = function (object) {
		
		credentials = new Credentials(object);
		
		return this;
		
	};
	
	this.deauthorize = function () {
		
		credentials = new Credentials(null);
		
		return this;
		
	};
	
	this.remember = function () {
			
		if (credentials.username && credentials.password) {
			
			var options = {
				url: proxyURL + '/_session',
				type: 'POST',
				data: 'name=' +  encodeURIComponent(credentials.username) + '&password=' +  encodeURIComponent(credentials.password),
				contentType: 'application/x-www-form-urlencoded'
			};
			
			$.ajax(options).fail(function (jqXHR, textStatus) {
				console.log('Error "' + textStatus + '" occured while ' + options.type + ' request to ' + options.url, jqXHR);
			}).done(function () {
				credentials.cookie = true;
			});
	
		}
		
		return this;
			
	};
	
	this.forget = function () {
		
		var options = {
			url: proxyURL + '/_session',
			type: 'DELETE'
		};
		
		$.ajax(options).fail(function (jqXHR, textStatus) {
			console.log('Error "' + textStatus + '" occured while ' + options.type + ' request to ' + options.url, jqXHR);
		}).done(function () {
			credentials.cookie = false;
		});
		
		return this;
		
	};
	
	this.Database = function (databaseName) {
		
		var AjaxOptions = function (options) {
			
			var documentPath = options.document ? '/' + options.document : '';
			
			this.type = options.type || 'GET';
			this.url = proxyURL + '/' + databaseName + documentPath;
			this.data = JSON.stringify(options.data) || undefined;
			this.contentType = this.data ? 'application/json' : undefined;
			
		};
		
		var request = function (options, done) {
			
			options = new AjaxOptions(options);
			
			if (!credentials.cookie && credentials.username && credentials.password) {
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
				document: document
			}, function (data, textStatus, jqXHR) {
				callback(JSON.parse(data), parseError(jqXHR));
			});
			
			return this;
			
		};
		
		this.exists = function (document, callback) {
			
			request({
				document: document,
				type: 'HEAD'
			}, function (oldData, textStatus, jqXHR) {
				
				if (jqXHR.status === 200) callback(jqXHR.getResponseHeader('Etag').replace(/"/g, ''), parseError(jqXHR)); // if file exists
				
				else callback(false, parseError(jqXHR)); // if file doesn't exist
				
			});
			
			return this;
			
		};
		
		this.view = function (doc, func, callback) {
			
			request({
				document: '_design/' + doc + '/_view/' + func
			}, function (data, textStatus, jqXHR) {
				callback(JSON.parse(data), parseError(jqXHR));
			});
			
			return this;
			
		};
			
		this.save = function (parameterOne, parameterTwo, parameterThree) {
			
			var put = function () {
				
				var document = parameterOne, data = parameterTwo, callback = parameterThree;
				
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
			
			var post = function () {
				
				var data = parameterOne, callback = parameterTwo;
				
				request({
					type: 'POST',
					data: data
				}, function (data, textStatus, jqXHR) {
					callback(JSON.parse(data), parseError(jqXHR));
				});
				
			};
			
			if (typeof parameterOne === 'string') put();
			else post();
			
			return this;
				
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
			
			return this;
		
		};
		
	};
	
}
