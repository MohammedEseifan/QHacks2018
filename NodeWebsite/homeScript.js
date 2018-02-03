$(document).ready(function() {
	$('.submitBtn').click(function(event) {
		window.location.replace(window.location.href+"authorize_user?username="+$('.username').val());
	});
});