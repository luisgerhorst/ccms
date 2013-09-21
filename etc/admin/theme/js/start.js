console.log('start');

if (theme.currentPath() != '/login') theme.open(theme.host+theme.rootPath+theme.sitePath + '/login?redirect=' + getRedirectPath());

function getRedirectPath() {
	var p = location.pathname.replace(new RegExp('^' + theme.rootPath+theme.sitePath), '');
	console.log('rdrkt1', p);
	p = !p || /^\/login[(\/.+$)($)]/.test(p) ? '/' : p;
	console.log('rdrkt2', p);
	return encodeURIComponent(p);
}