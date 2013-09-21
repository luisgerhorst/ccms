console.log('start');

if (window.theme.currentPath() != '/login') window.theme.open(window.theme.urlRoot + '/login?redirect=' + getRedirectPath());

function getRedirectPath() {
	var p = location.pathname.replace(new RegExp('^' + window.theme.urlRoot), '');
	p = !p || /^\/login[(\/.+$)($)]/.test(p) ? '/' : p;
	return encodeURIComponent(p);
}