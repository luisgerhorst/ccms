function fatalError(title, message) {
	
	document.title = title;
	
	$('body').html('<div id="error"><h1>'+ title + '</h1><p>'+ message + '</p></div>');
	$('body').removeClass('changing');
	$('body').attr('status', 'filled');
	
}