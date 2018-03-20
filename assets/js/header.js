$(document).ready(function(){

	$('.menu-interne li').hover(function(){

		$('ul:first', this).stop().slideDown();


	}, function() {
		$('ul:first', this).stop().slideUp();
	});
});