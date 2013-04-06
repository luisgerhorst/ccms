function setRoutes(template, config) {
	
	template.route(/^\/$/, [], function () {
		document.title = 'CCMS';
		window.location = '#/setup-db-docs'
	});
	
	template.route(/^\/setup-db-docs$/, ['header', 'setup-db-docs', 'footer'], function () {
		
		document.title = 'CCMS';
		
		$('#setup-db-docs').submit(function () { // on save
			
			var title = $('#setup-db-docs-title').val();
			var username = $('#setup-db-docs-username').val();
			var password = $('#setup-db-docs-password').val();
			
			var couchdb = new CouchDB(config.couchdbProxy, config.database, username, password);
			
			couchdb.save('_design/auth', { // auth
				language: "javascript",
				validate_doc_update: "function(newDoc, oldDoc, userCtx) { if (userCtx.roles.indexOf('_admin') !== -1) { return; } else { throw({forbidden: 'Only admins may edit the database'}); } }"
			}, function (response, error) {
				if (error) {
					
					if (error.code == 401) alert('Your username/password seems to be incorrect.');
					else alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
					
				} else {
					
					couchdb.save('_design/posts', { // post views
						language: "javascript",
						views: {
							all: {
								map: "function (doc) { if (doc.type === 'post') emit([doc.date, doc._id], doc); }"
							}
						}
					}, function (response, error) {
						if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
						else {
							
							couchdb.save('meta', { // meta
								ccmsVersion: ccmsVersion,
								copyright: title,
								copyrightYearsEnd: parseInt(moment().format('YYYY')),
								copyrightYearsStart: parseInt(moment().format('YYYY')),
								description: '',
								postsPerPage: 10,
								title: title
							}, function (response, error) {
								if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while saving the document "_design/auth" to the database "ccms".');
								else window.location = 'admin.html#/';
							});
							
						}
					});
					
				}
			});
		
			return false; // so the page doesn't reload
		
		});
		
	});
	
}