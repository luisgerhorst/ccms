var update = function (options) {
	
	database.read('meta', function (meta, error) { if (!error) {
	
		for (var i in options) meta[i] = options[i];
		
		database.save('meta', meta, function (response, error) {
			if (!error) window.location = '#/';
		});
	
	}});
	
};

$('.meta form').submit(function () { // on save
	
	var theme = $('.meta form input.theme').val();
	
	update({
		title: $('.meta form input.title').val(),
		description: $('.meta form textarea.description').val(),
		postsPerPage: parseInt($('.meta form input.postsPerPage').val()),
		copyright: $('.meta form input.copyright').val(),
		theme: theme ? theme : 'default'
	});
	
	return false; // no reload
	
});