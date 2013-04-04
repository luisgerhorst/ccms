function setRoutes(template, couchdb) {
	
	template.route(/^\/$/, [], function () {
		document.title = 'CCMS';
		window.location = '#/setup-meta'
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