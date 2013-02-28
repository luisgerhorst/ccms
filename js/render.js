var render = function () { // is called after config.json was loaded
	
	couchdb.read('meta', function (response, error) {
		
		if (error) console.log('Error while reading "meta".', error);
		
		window.Theme = Ember.Application.create();
		
		window.Theme.ApplicationController = Ember.Controller.extend({
			title: response.title,
			description: response.description,
			postsPerPage: response.postsPerPage
		});
		
	});
	
};