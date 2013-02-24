
var CouchDB = function (proxyPath, database, username, password) {
	
	var editor = false;
	if (typeof username !== 'undefined' && typeof password !== 'undefined') editor = true;

	var request = function (options) {
		
		if (options.callback == null) options.callback = function () {};
		if (options.data == null) options.data = '';
		
		var ajaxOptions = new (function () {
	
			this.type = options.method;
			this.url = proxyPath + '/' + database + '/' + options.document;
			this.data = JSON.stringify(options.data);
			this.error = options.errorCallback;
			
			if (editor) {
				this.beforeSend = function (xhr) {
					xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
				}; // don't know why the jQuery ajax username and password properties didn't work instead of this
			}
			
		})();
		
		var done = function (msg) {
			console.log('Received response to ' + ajaxOptions.type + ' request to ' + ajaxOptions.url + '.', msg);
			options.callback(msg);
		}; // callback
		
		$.ajax(ajaxOptions).done(done); // send
		console.log('Sent ' + ajaxOptions.type + ' request to ' + ajaxOptions.url + ' ...'); // log
		
	};
	
	this.read = function (document, callback) {
		request({
			document: document,
			method: 'GET',
			callback: callback
		});
	};
	
	this.view = function (doc, func, callback) {
		request({
			document: '_design/' + doc + '/_view/' + func,
			method: 'GET',
			callback: callback
		});
	};
	
	if (editor) {
		
		this.save = function (document, data, callback) {
			request({
				document: document,
				method: 'HEAD',
				errorCallback: function (jqXHR, textStatus, errorThrown) {
					// console.log('Function errorCallback called.', jqXHR);
					if (jqXHR.status === 404) request({
						document: document,
						method: 'PUT',
						callback: callback,
						data: data
					});
				}
			});
		};
		
	}
	
}
