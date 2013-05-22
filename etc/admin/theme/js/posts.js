$('.posts ol li time').each(function (index) {
	var timeElement = $(this);
	var unix = parseInt(timeElement.attr('datetime'));
	var date = moment.unix(unix).format('MMM D, YYYY'); // .fromNow();
	timeElement.html(date);
});