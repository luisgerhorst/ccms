var routes = [
	{
		path: ['/login', /^\/login\/redirect=.+/],
		templates: ['login.html'],
		title: 'Login'
	},
	{
		path: '/logout',
		templates: ['logout.html'],
		title: 'Logging out ...'
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