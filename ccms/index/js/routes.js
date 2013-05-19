function routes() {
	
	theme.route([
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path) {
				if (path === '/page/0') window.location = '#/';
			},
			title: '{{header_html.title}}'
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{header_html.title}} - {{post_html.title}}'
		}
	]);
	
}