function routes() {

	theme.route([
		{
			path: '/logout',
			before: function () {
				couchdb.forget().deauthorize();
				login();
			}
		},
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path) {
				if (path === '/page/0') window.location = '#/';
			},
			title: '{{#header}}{{title}}{{/header}}'
		},
		{
			path: '/meta',
			templates: ['header.html', 'meta.html', 'footer.html'],
			title: '{{#header}}{{title}} - {{/header}}Meta'
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{#header}}{{title}} - {{/header}}{{#post}}{{title}}{{/post}}'
		},
		{
			path: '/create/post',
			templates: ['header.html', 'create-post.html', 'footer.html'],
			title: '{{#header}}{{title}} - {{/header}}Create Post'
		}
	]);
	
}