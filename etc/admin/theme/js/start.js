var getRedirectPath = function () {
	
	var p = document.URL;
	
	p = /#.+$/.test(p) ? p.replace(/^.*#/, '') : '/';
	
	p = p === '/login' ? '/' : p;
	p = /^\/login\/.*/.test(p) ? '/' : p;
	p = p === '/logout' ? '/' : p;
	
	p = p === '/' ? p : p.replace(/\/$/, '');
	p = encodeURIComponent(p);
	
	return p;
	
};

window.location = '#/login/redirect=' + getRedirectPath();

var notifications = new (function () {
	
	this.alert = function (message, callback) {
		
		$('body').append('<div class="notification alert"><div class="box"><p class="message">' + message + '</p><button class="ok">OK</button></div></div>');
		
		$('.notification button.ok').click(function () {
			$('.notification').remove();
			callback();
		});
		
	};
	
	this.confirm = function (question, no, yes, callback) {
		
		$('body').append('<div class="notification confirm"><div class="box"><p class="question">' + question + '</p><button class="no grey">' + no + '</button><button class="yes grey">' + yes + '</button></div></div>');
		
		$('.notification button.yes').click(function () {
			$('.notification').remove();
			callback(true);
		});
		
		$('.notification button.no').click(function () {
			$('.notification').remove();
			callback(false);
		});
		
	};
	
})();