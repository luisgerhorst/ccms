var metaDoc = new (function () {
	
	this.update = function (doc, redirect) {
	
		database.read('meta', function (meta, err) { if (!err) {
	
			for (var i in doc) meta[i] = doc[i];
	
			database.save('meta', meta, function (response, error) {
				if (!error && redirect !== false) window.theme.open('/');
			});
	
		}});
	
	};
	
})();