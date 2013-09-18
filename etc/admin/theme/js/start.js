var getRedirectPath = function () {
	
	var p = document.URL;
	
	p = /#.+$/.test(p) ? p.replace(/^.*#/, '') : '/';
	
	p = p === '/login' ? '/' : p;
	p = /^\/login\/.*/.test(p) ? '/' : p;
	p = p === '/logout' ? '/' : p;
	
	p = p === '/' ? p : p.replace(/\/$/, '');
	p = encodeURIComponent(p);
	
	return p;
	
};

window.location = '#/login/redirect=' + getRedirectPath();