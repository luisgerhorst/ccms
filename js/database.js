
var CouchDB = function (proxyPath, database, username, password) {
	
	var editor = false;
	if (typeof username !== 'undefined' && typeof password !== 'undefined') editor = true;

	var request = function (options) {
		
		options.url = proxyPath + '/' + database + '/' + options.document;
		options.document = null;
		options.data = JSON.stringify(options.data);
		
		var success = options.success;
		options.success = function (data, textStatus, jqXHR) {
			data = JSON.parse(data);
			console.log('Received response to ' + options.type + ' request to ' + options.url + '.', data);
			if (success != null) success(data);
		}
		
		var error = options.error;
		options.error = function (jqXHR, textStatus, errorThrown) {
			console.log('Error while ' + options.type + ' request to ' + options.url + '.', jqXHR);
			if (error != null) error(jqXHR, textStatus, errorThrown);
		}
		
		if (editor) {
			options.beforeSend = function (xhr) {
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
			}; // don't know why the jQuery ajax username and password properties didn't work instead of this
		}
		
		$.ajax(options); // send
		console.log('Sent ' + options.type + ' request to ' + options.url + ' ...'); // log
		
	};
	
	this.read = function (document, callback) {
		request({
			document: document,
			type: 'GET',
			success: callback
		});
	};
	
	this.view = function (doc, func, callback) {
		request({
			document: '_design/' + doc + '/_view/' + func,
			type: 'GET',
			success: callback
		});
	};
	
	if (editor) {
		
		this.save = function (document, data, callback) {
			
			var saveRequest = function (data) {
				
				request({
					document: document,
					type: 'PUT',
					success: callback,
					data: data
				});
				
			};
			
			request({
				document: document,
				type: 'GET',
				success: function (oldData) {
					data._rev = oldData._rev;
					saveRequest(data);
				},
				error: function (error) {
					if (error.status == 404) saveRequest(data);
				}
			});

		};
		
	}
	
}
