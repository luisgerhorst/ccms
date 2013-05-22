var getRedirectPath = function () {
	
	var path = document.URL;
	path = /#.+$/.test(path) ? path.replace(/^.*#/, '') : '/';
	
	path = path === '/login' ? '/' : path;
	path = /^\/login\/.*/.test(path) ? '/' : path;
	path = path === '/logout' ? '/' : path;
	
	path = path === '/' ? path : path.replace(/\/$/, '');
	path = encodeURIComponent(path);
	return path;
	
};

window.location = '#/login/redirect=' + getRedirectPath();