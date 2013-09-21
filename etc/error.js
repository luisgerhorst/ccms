function fatalError(title, message) {
	window.theme.update(title, '<div id="error"><h1>'+ title + '</h1><p>'+ message + '</p></div>');
}