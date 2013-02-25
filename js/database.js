
var CouchDB = function (proxyPath, database, log, editor, username, password) {

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
			
			var save = function (data) {
				
				request({
					document: document,
					type: 'PUT',
					data: data
				}, function (data, textStatus, jqXHR) {
					callback(JSON.parse(data), parseError(jqXHR));
				});
				
			};
			
			request({
				document: document,
				type: 'HEAD'
			}, function (oldData, textStatus, jqXHR) {
				
				var status = jqXHR.status;
				
				if (status === 200) data._rev = jqXHR.getResponseHeader('Etag').replace(/"/g, '');
				
				if (status === 404 || status === 200) save(data);
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
					callback(null, { code: 404, message: 'Object Not Found' });
				}
				
			});
		
		};
		
	}
	
	function parseError(jqXHR) {
		var status = jqXHR.status;
		if (status !== 200 && status !== 201 ) return {
			code: status,
			message: jqXHR.statusText
		};
		else return false;
	}
	
}
