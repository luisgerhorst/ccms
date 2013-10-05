var notifications = {

	alert: function (message, callback) {

		var id = Math.round(Math.pow(2, 32) * Math.random());

		$('body').append('<div id="notification-' + id + '" class="notification alert"><div class="box"><p class="message">' + message + '</p><button class="ok">OK</button></div></div>');

		$('#notification-' + id + ' button.ok').click(function () {
			$('#notification-' + id).remove();
			callback();
		});

	},

	confirm: function (question, no, yes, callback) {

		var id = Math.round(Math.pow(2, 32) * Math.random());

		$('body').append('<div id="notification-' + id + '" class="notification confirm"><div class="box"><p class="question">' + question + '</p><button class="no grey">' + no + '</button><button class="yes grey">' + yes + '</button></div></div>');

		$('#notification-' + id + ' button.yes').click(function () {
			$('#notification-' + id).remove();
			callback(true);
		});

		$('#notification-' + id + ' button.no').click(function () {
			$('#notification-' + id).remove();
			callback(false);
		});

	}

}