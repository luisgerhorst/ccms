function setRoutes(template, couchdb, meta) {
	
	template.route(/^\/$/, ['header', 'index', 'footer'], function () {
		document.title = meta.title;
	});
	
	template.route(/^(\/posts\/).+$/, ['header', 'post', 'footer'], function (views) {
		document.title = meta.title + ' - ' + views.post.title;
	});
	
}