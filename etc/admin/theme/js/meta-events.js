$('.meta form').submit(function () { // on save
	
	var theme = $('.meta form input.theme').val();
	
	metaDoc.update({
		title: $('.meta form input.title').val(),
		description: $('.meta form textarea.description').val(),
		postsPerPage: parseInt($('.meta form input.postsPerPage').val()),
		copyright: $('.meta form input.copyright').val(),
		theme: theme ? theme : 'default'
	});
	
	return false; // no reload
	
});