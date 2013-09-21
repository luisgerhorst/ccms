/*theme.open(theme.host+theme.rootPath+theme.sitePath + '/login?redirect=' + getRedirectPath());

function getRedirectPath() {
	var p = location.pathname.replace(new RegExp('^' + theme.rootPath+theme.sitePath), ''); // get path
	p = !p || /^\/login[(\/.+$)($)]/.test(p) ? '/' : p;
	return encodeURIComponent(p);
}*/

var currentPath = window.theme.currentPath();

if (currentPath != '/login') {
	if (currentPath == '/' || currentPath == '/logout') var url = '/login';
	else var url = '/login?redirect=' + encodeURIComponent(currentPath);
	window.theme.open(theme.host+theme.rootPath+theme.sitePath + url);
}