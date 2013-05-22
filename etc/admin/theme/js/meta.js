var metaDoc = new (function () {
	
	var update = function (doc) {
	
		database.read('meta', function (meta, err) { if (!err) {
	
			for (var i in doc) meta[i] = doc[i];
	
			database.save('meta', meta, function (response, error) {
				if (!error) window.location = '#/';
			});
	
		}});
	
	};
	
	var updateCopyrightYears = function () {
		
		var copyrightYearsString = function (start, end) {
			if (start === end) return start + '';
			else if (start < end) return start + ' - ' + end;
			else if (start > end) return end + ' - ' + start;
		};
		
		var year = parseInt(moment().format('YYYY'));
		
		database.read('meta', function (meta, err) { if (!err) {
		
			var options = {
				copyrightYearsEnd: year,
				copyrightYears: copyrightYearsString(meta.copyrightYearsStart, year)
			};
		
			update(options);
		
		}});
	
	};
	
	// Export
	
	this.update = update;
	this.updateCopyrightYears = updateCopyrightYears;
	
})();