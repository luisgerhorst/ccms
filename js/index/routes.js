function routes() {
	
	template.route([
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header', 'posts', 'footer'],
			before: function (path) {
				if (path === '/page/0') window.location = '#/';
			},
			head: {
				title: '{{#header}}{{title}}{{/header}}'
			}
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header', 'post', 'footer'],
			head: {
				title: '{{#header}}{{title}} - {{/header}}{{#post}}{{title}}{{/post}}'
			}
		}
	]);
	
}