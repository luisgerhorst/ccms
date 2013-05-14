function routes() {
	
	theme.route([
		{
			path: '/',
			before: function () {
				window.location = '#/setup-db'
			}
		},
		{
			path: '/setup-db',
			files: ['header.html', 'setupdb.html', 'footer.html', 'setupdb.js'],
			title: 'Install'
		}
	]);
		
}