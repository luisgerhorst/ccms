var routes = [
	{
		path: '/',
		before: function () {
			window.location = '#/setup-db'
		}
	},
	{
		path: '/setup-db',
		templates: ['header.html', 'setupdb.html', 'footer.html'],
		title: 'Install'
	}
];