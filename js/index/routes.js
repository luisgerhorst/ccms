function routes() {
	
	template.route([
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header', 'index', 'footer'],
			before: function (path) {
				if (path === '/page/0') window.location = '#/';
				else document.title = meta.title;
			}
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header', 'post', 'footer'],
			done: function (views) {
				document.title = meta.title + ' - ' + views.post.title;
			}
		}
	]);
	
}