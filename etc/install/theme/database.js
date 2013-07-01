var saveDocs = function (database, ccms) {
	
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
					byDate: {
						map: "function (doc) { if (doc.type === 'post') emit([doc.date, doc.postID], doc); }"
					},
					compactByDate: {
						map: "function (doc) { if (doc.type === 'post') emit([doc.date, doc.postID]); }"
					},
					byPostID: {
						map: "function (doc) { if (doc.type === 'post') emit(doc.postID, doc); }"
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
				title: title,
				theme: 'default'
			}
		}
	};
	
	var errorThrown = false; // no multiple alerts
	
	for (var i in docs) (function (i) {
			
		var doc = docs[i];
		
		database.save(doc.id, doc.content, function (response, error) {
			
			if (!errorThrown && error) {
				if (error.code == 401) alert('Your username/password seems to be incorrect.');
				else if (error.code == 403) alert('Please enter username and password.');
				else alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.');
			}
			else if (!error) {
				console.log('Successfully saved document.', doc.id);
				docs[i].created = true;
			}
			
			if (error) errorThrown = true;
			
			var allCreated = true;
			for (var j in docs) if (!docs[j].created) allCreated = false;
			if (allCreated) window.location = 'admin.html#/';
			
		});
		
	})(i);
	
};

var setupDB = function () { // on save
	
	$.ajax({
		url: 'config.json'
	}).done(function (config) {
		
		var couchdb = new CouchDB(config.proxy).forget().authorize({
			username: config.accountPrefix + $('#setup-db-username').val(),
			password: $('#setup-db-password').val()
		});
		
		var database = new couchdb.Database(config.database);
		
		$.ajax({
			url: 'etc/system.json'
		}).done(function (ccms) {
			
			saveDocs(database, ccms);
			
		});
		
	});

	return false; // no reload

};

$('#setup-db').submit(setupDB);