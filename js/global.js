var ccmsVersion = '0.0.1'; // used to check if the used database is compatible with this version of CCMS

function copyrightYearsString(start, end) {
	if (start === end) return start + '';
	else if (start < end) return start + ' - ' + end;
	else if (start > end) {
		console.log('Copyright years start > end, I\'ll fix that.', start, end);
		return end + ' - ' + start;
	}
	else console.log('Copyright years are invalid.', start, end);
}

function updateCopyrightYears(couchdb) {
	
	var year = parseInt(moment().format('YYYY'));
	
	couchdb.read('meta', function (meta, error) {
		
		if (error) console.log('Error while reading document "meta".', error);
		else {
			
			var older = year < meta.copyrightYearsStart, newer = year > meta.copyrightYearsEnd;
			
			if (older || newer) {
				
				if (older) meta.copyrightYearsStart = year;
				else meta.copyrightYearsEnd = year;
				meta.copyrightYears = copyrightYearsString(meta.copyrightYearsStart, meta.copyrightYearsEnd);
				
				couchdb.save('meta', meta, function (response, error) {
					if (error) console.log('Error.', error);
				});
				
			}
			
		}
		
	});
	
}