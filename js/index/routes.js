function setRoutes(template, couchdb, meta) {
	
	template.route('/', ['header', 'index', 'footer'], function () {
		document.title = meta.title;
	});
	
	template.route(/^\/post\/.+$/, ['header', 'post', 'footer'], function (views) {
		document.title = meta.title + ' - ' + views.post.title;
	});
	
	template.route(/^\/page\/\d+$/, ['header', 'index', 'footer'], function (views) {
		document.title = meta.title;
	}, function (path) {
		if (path === '/page/0') window.location = '#/';
	});
	
}