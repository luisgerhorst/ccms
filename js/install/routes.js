function routes() {
	
	var saveDocs = function (database) {
		
		database.save('_design/auth', { // auth
			language: "javascript",
			validate_doc_update: "function(newDoc, oldDoc, userCtx) { if (userCtx.roles.indexOf('_admin') !== -1) { return; } else { throw({forbidden: 'Only admins may edit the database'}); } }"
		}, function (response, error) {
			if (error) {
				
				if (error.code == 401) alert('Your username/password seems to be incorrect.');
				else alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
				
			} else {
				
				database.save('_design/posts', { // post views
					language: "javascript",
					views: {
						all: {
							map: "function (doc) { if (doc.type === 'post') emit([doc.date, doc.postID], doc); }"
						},
						date: {
							map: "function (doc) { if (doc.type === 'post') emit(doc.date, doc.postID); }"
						}
					}
				}, function (response, error) {
					if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
					else {
						
						var title = $('#setup-db-docs-title').val();
						var year = parseInt(moment().format('YYYY'));
						
						var meta = { // meta
							ccmsVersion: ccmsVersion,
							copyright: title,
							copyrightYears: year + '',
							copyrightYearsEnd: year,
							copyrightYearsStart: year,
							description: '',
							postsPerPage: 10,
							title: title
						}
						
						database.save('meta', meta, function (response, error) {
							if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
							else window.location = 'admin.html#/';
						});
						
					}
				});
				
			}
		});
		
	}
	
	template.route([
		{
			path: '/',
			before: function () {
				document.title = 'CCMS';
				window.location = '#/setup-db'
			}
		},
		{
			path: '/setup-db',
			templates: ['header', 'setupDB', 'footer'],
			done: function () {
				
				document.title = 'CCMS';
				
				$('#setup-db-docs').submit(function () { // on save
					
					var couchdb = new CouchDB(config.couchdbProxy);
						couchdb.authorization.add({
							username: $('#setup-db-docs-username').val(),
							password: $('#setup-db-docs-password').val()
						});
					var database = couchdb.database(config.database);
					
					saveDocs(database);
				
					return false; // so the page doesn't reload
				
				});
				
			} // done()
		}
	]);
		
}