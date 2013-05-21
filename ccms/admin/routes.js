var routes = function (theme) {
	
	var r = [
		{
			path: '/login',
			templates: ['login.html'],
		},
		{
			path: '/logout',
			templates: ['logout.html'],
		},
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path) {
				if (path === '/page/0') window.location = '#/';
			},
			title: '{{header_html.title}}'
		},
		{
			path: '/meta',
			templates: ['header.html', 'meta.html', 'footer.html'],
			title: '{{header_html.title}} - Meta'
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{header_html.title}} - {{post_html.title}}'
		},
		{
			path: '/create/post',
			templates: ['header.html', 'create-post.html', 'footer.html'],
			title: '{{header_html.title}} - Create Post'
		}
	];
	
	theme.routes.push({
		path: '/login',
		templates: ['login.html'],
	});
	
	return theme;
	
}