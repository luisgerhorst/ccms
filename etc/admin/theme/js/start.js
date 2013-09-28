var currentPath = window.theme.currentPath();

if (currentPath != '/login') {

	$.ajax({
		url: '_root/config.json',
		dataType: 'json',
		error: function (jqXHR, textStatus, errorThrown) {
			notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
		}
	}).done(function (config) {
		tryCookie(config.database);
	});
	
}

function tryCookie(databaseName, currentPath) {

	var couchdb = new CouchDB(window.theme.rootPath + '/couchdb').authorize({ cookie: true });
	var database = new couchdb.Database(databaseName);

	database.save('test', { time: new Date().getTime() }, function (response, error) {
		
		if (error && error.code != 401 && error.code != 403) console.log('Error occured while testing cookie authorization.', error);
		
		if (error) openLoginForm();
		else foundValid(couchdb, database);
		
	});

}

function foundValid(couchdb, database) {
	
	console.log('Cookie auth successfull.');
	
	window.couchdb = couchdb;
	window.database = database;
	
}

function openLoginForm() {
	
	console.log('Cookie auth failed, redirecting to login form.');

	var path = (currentPath == '/' || currentPath == '/logout') ? '/login' : '/login?redirect='+encodeURIComponent(currentPath);
	window.open(theme.host+theme.rootPath+theme.sitePath+path);

}