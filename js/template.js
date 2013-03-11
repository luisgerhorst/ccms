
var Template = function () {
	
	this.Page = function (path, load) {
		
	};
	
};

Template.prototype.path = function () {
	var url = document.URL;
	if (/#.+$/.test(url)) return url.replace(/^.*#/, ''); // path will be everything after "#"
	else return '/';
};
