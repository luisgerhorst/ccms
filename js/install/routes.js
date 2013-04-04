function setRoutes(template, couchdb) {
	
	template.route(/^\/$/, [], function () {
		document.title = 'CCMS';
		window.location = '#/setup-db'
	});
	
	template.route(/^\/setup-db$/, ['header', 'setup-db', 'footer'], function (views) {
		
		var config = views['setup-db'];
		
		document.title = 'CCMS';
		
		$('#setup-db-login').submit(function () { // on save
		
			$.ajax({
				type: "GET",
				url: config.couchdbProxy + '/_all_dbs'
			}).done(function(databases) {
				
				databases = JSON.parse(databases);
				
				console.log('Received existing DBs.', databases);
				
				var exists = false;
				for (var i = databases.length; i--;) {
					if (databases[i] == config.database) exists = true;
				}
				
				if (exists) alert('Database does already exist.');
				else createDB();
				
			});
			
			function createDB() {
				
				var username = $('#setup-db-username').val(), password = $('#setup-db-password').val();
				
				$.ajax({
					type: "PUT",
					url: config.couchdbProxy + '/' + config.database + '/',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
					}
				}).done(function(res) {
					window.location = '#/setup-meta'
				});
				
			}
			
			return false;
		
		});
		
		$('#db-reload').click(function () { // on save
			window.location.reload();
		});
		
	});
	
	template.route(/^\/setup-meta$/, ['header', 'setup-meta', 'footer'], function () {
		
		document.title = 'CCMS';
		
		$('#meta-create').submit(function () { // on save
		
			var title = $('#meta-create-title').val();
		
			couchdb.save('meta', {
				
				ccmsVersion: ccmsVersion,
				copyright: title,
				copyrightYearsEnd: parseInt(moment().format('YYYY')),
				copyrightYearsStart: parseInt(moment().format('YYYY')),
				description: '',
				postsPerPage: 10,
				title: title
				
			}, function (response, error) {
			
				if (error) console.log('Error.', error);
			
				else window.location = 'admin.html#/';
			
			});
		
			return false; // so the page doesn't reload
		
		});
		
	});
	
}