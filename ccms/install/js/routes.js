function routes() {
	
	template.route([
		{
			path: '/',
			before: function () {
				window.location = '#/setup-db'
			}
		},
		{
			path: '/setup-db',
			templates: ['header', 'setupdb', 'footer'],
			title: 'Install'
		}
	]);
		
}