function routes() {
	
	var saveDocs = function (database) {
		
		var title = $('#setup-db-title').val();
		var year = parseInt(moment().format('YYYY'));
		
		var docs = {
			designAuth: {
				id: '_design/auth',
				content: {
					language: "javascript",
					validate_doc_update: "function(newDoc, oldDoc, userCtx) { if (userCtx.roles.indexOf('_admin') !== -1) { return; } else { throw({forbidden: 'Only admins may edit the database'}); } }"
				}
			},
			designPosts: {
				id: '_design/posts',
				content: {
					language: "javascript",
					views: {
						all: {
							map: "function (doc) { if (doc.type === 'post') emit([doc.date, doc.postID], doc); }"
						},
						date: {
							map: "function (doc) { if (doc.type === 'post') emit(doc.date, doc.postID); }"
						}
					}
				}
			},
			meta: {
				id: 'meta',
				content: {
					ccms: ccms,
					copyright: title,
					copyrightYears: year + '',
					copyrightYearsEnd: year,
					copyrightYearsStart: year,
					description: '',
					postsPerPage: 10,
					title: title
				}
			},
			posts: {
				id: 'posts',
				content: {
					ids: []
				}
			}
		};
		
		for (var i in docs) (function (i) {
				
			var doc = docs[i];
			
			database.save(doc.id, doc.content, function (response, error) {
				
				if (error) console.log('Error while saving document.', doc.id, error);
				else {
					console.log('Successfully saved document.', doc.id);
					docs[i].created = true;
				}
				
				var allCreated = true;
				for (var j in docs) if (!docs[j].created) allCreated = false;
				if (allCreated) window.location = 'admin.html#/';
				
			});
			
		})(i);
		
	};
	
	var setupDB = function () { // on save
		
		var couchdb = new CouchDB(config.couchdbProxy).forget().authorize({
			username: $('#setup-db-username').val(),
			password: $('#setup-db-password').val()
		});
		var database = new couchdb.Database(config.database);
		
		saveDocs(database);
	
		return false; // no reload
	
	};
	
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
			before: function () {
				document.title = 'CCMS';
			},
			done: function () {
				
				$('#setup-db').submit(setupDB);
				
			} // done()
		}
	]);
		
}