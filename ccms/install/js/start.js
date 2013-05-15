$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (res) {
		config = res;
		routes();
	});

});