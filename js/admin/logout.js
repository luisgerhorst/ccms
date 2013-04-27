var logout = function () {
	
	template.route('/logout', null, null, function () {
		
		couchdb.deleteSession();
		
		login(template);
		
	});
	
};