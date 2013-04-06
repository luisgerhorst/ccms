$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		var template = new Template();

		render(template);
		setRoutes(template, config);
		template.load();

	});

});