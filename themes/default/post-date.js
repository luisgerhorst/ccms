$('article.post time').html(function () {
	return moment.unix( parseInt( $(this).attr('datetime') ) ).format('MMM D, YYYY');
});