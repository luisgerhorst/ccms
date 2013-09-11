var fatalError = function (header, text) {
	
	document.title = header;
	
	$('body').html('<div id="error"><h1>'+ header + '</h1><p>'+ text + '</p></div>');
	
}