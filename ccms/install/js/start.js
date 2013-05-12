$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (response) {
		config = response;
		routes();
	});

});