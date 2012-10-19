(function ($) {
	$.createPoker = function (t, p) { };

	var docloaded = false;
	$(document).ready(function () {
		docloaded = true
	});

	$.fn.cavPoker = function (p) {
		return this.each(function () {
			if (!docloaded) {
				$(this).hide();
				var t = this;
				$(document).ready(function () {
					$.addFlex(t, p);
				});
			} else {
				$.addFlex(this, p);
			}
		});
	};
})(jQuery);