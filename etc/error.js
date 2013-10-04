function fatalError(title, message) {

	document.title = title;

	var html = '<div id="error"><h1>'+ title + '</h1><p>'+ message + '</p></div>';

	var body = $('body');
	body.html(html);
	body.removeClass('changing');
	body.attr('data-status', 'filled');

}