(function ($) {
	$.createPoker = function (t, p) {
		if (t.cav) return false; //return if already exist

		p = $.extend({ //apply default properties
			Id: -1,
			No: -1,
			Suit: -1,
			ImgUrl:"",
			handCard: true,
			pokerTemplate: "",
			zIndex: -1,
			left: 0,
			top:0
		}, p);

		var pokerHtml = Mustache.to_html(p.pokerTemplate, p).replace(/^\s*/mg, '');
		$(t).append(pokerHtml)
			.attr("id", p.Id)
			.addClass("Poker")
			.addClass(p.handCard ? "HandCard" : "OppHandCard")
			.css("z-index", p.zIndex)
			.css("left", p.left)
			.css("top", p.top);

		var c = {
			moveTo: function (left, top, speed) {
				$(t).animate({ left: left, top: top }, speed);
			},
			moveUpFlag: false,
			moveUp: function () {
				$(t).animate({ top: "-=92", "z-index": "+=100", width: "+=48", height: "+=72" }, 100)
				.find(".Beauty").animate({ width: "+=48", height: "+=72" }, 100);
			},
			moveDown: function () {
				$(t).animate({ top: "+=92", "z-index": "-=100", width: "-=48", height: "-=72" }, 100)
				.find(".Beauty").animate({ width: "-=48", height: "-=72" }, 100);
			},

			dragStart: function (e) {
				console.log("dragStart");
				document.oPosition = $(t).offset();
				document.oPosition.right = document.oPosition.left + $(t).width();
				document.oPosition.bottom = document.oPosition.top + $(t).height();
				document.dragPoker = t;
				document.dragPokerIndex = $(".HandCard").index(t);
				document.pokerCopy = $(t).clone().removeClass("HandCard");
				$(document.pokerCopy).css({
					position: 'absolute',
					float: 'left',
					display: 'none'
				});
				$('body').append(document.pokerCopy);
				$('body').noSelect();

				$(document).bind("mousemove", function (e) {
					c.dragMove(e);
				});
			},
			dragMove: function (e) {
				if (document.pokerCopy) {
					console.log("dragMove");
					if (e.pageX > document.oPosition.right || e.pageX < document.oPosition.left || e.pageY > document.oPosition.bottom || e.pageY < document.oPosition.top) {
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(document.pokerCopy).css({
						top: e.pageY + 15,
						left: e.pageX + 15,
						display: 'block'
					});
					$(document.dragPoker).hide();
				}
			},
			dragEnd: function () {
				if (document.pokerCopy) {
					$(document.pokerCopy).remove();
					$(document.dragPoker).show();
					if (document.dragPokerTargetIndex != null) {
						console.log(document.dragPokerTargetIndex);
						console.log(document.dragPokerIndex);
						console.log("dragEnd");

						var tp = $(".HandCard").eq(document.dragPokerTargetIndex);
						var tSet = tp.offset();
						var tz = tp.css("z-index");

						var op = $(".HandCard").eq(document.dragPokerIndex);
						var oSet = op.offset();
						var oz = op.css("z-index");

						tp.animate({ top: oSet.top - 5, left: oSet.left - 5, "z-index": oz });
						op.animate({ top: tSet.top - 5, left: tSet.left - 5, "z-index": tz });
					}
					document.dragPoker = null;
					document.oPosition = null;
					document.dragPokerIndex = null;
					document.dragPokerTargetIndex = null;
					document.pokerCopy = null;
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);

				$(document).unbind("mousemove");
			},
		};

		$(t).click(function () {
			if (!c.moveUpFlag) {
				c.moveUp();
				c.moveUpFlag = true;
			} else {
				c.moveDown();
				c.moveUpFlag = false;
			}
		}).mousedown(function (e) {
			if (!$(t).hasClass("HandCard")) return;

			c.dragStart(e);
		}).mouseenter(function () {
			if (document.pokerCopy) {
				var n = $(".HandCard").index(this);
				if (n == document.dragPokerIndex) {
					return false;
				}

				document.dragPokerTargetIndex = n;
			}
		});

		$(document).mouseup(function () { }, function (e) {
			c.dragEnd();
		});

		t.p = p;
		t.cav = c;

		return t;
	};

	var docloaded = false;
	$(document).ready(function () {
		docloaded = true
	});

	$.fn.cavPoker = function (p) {
		return this.each(function () {
			if (!docloaded) {
				var t = this;
				$(document).ready(function () {
					$.createPoker(t, p);
				});
			} else {
				$.createPoker(this, p);
			}
		});
	};
	$.fn.cavPokerMoveTo = function (left, top, speed) {
		return this.each(function () {
			if (this.cav) this.cav.moveTo(left, top, speed);
		});
	};

	$.fn.noSelect = function (p) { //no select plugin by me :-)
		var prevent = (p == null) ? true : p;
		if (prevent) {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () {
					return false;
				});
				else if ($.browser.mozilla) {
					$(this).css('MozUserSelect', 'none');
					$('body').trigger('focus');
				} else if ($.browser.opera) $(this).bind('mousedown', function () {
					return false;
				});
				else $(this).attr('unselectable', 'on');
			});
		} else {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable', 'on');
			});
		}
	};
})(jQuery);