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
			moveTo: function (left, top, speed, callback) {
				$(t).animate({ left: left, top: top }, speed, callback);
			},
			moveUpFlag: false,
			moveUp: function () {
			    if (this.locked) return;
				$(t).animate({ top: "-=92", "z-index": "+=100", width: "+=48", height: "+=72" }, 100)
				.find(".Beauty").animate({ width: "+=48", height: "+=72" }, 100);
			},
			moveDown: function () {
			    if (this.locked) return;
			    $(t).animate({ top: "+=92", "z-index": "-=100", width: "-=48", height: "-=72" }, 100)
				.find(".Beauty").animate({ width: "-=48", height: "-=72" }, 100);
			},

			locked: true,
			lock: function () {
			    this.locked = true;
			},
			unlock: function () {
			    this.locked = false;
			},

			turnToFront: function (imgUrl) {
			    var op = $(t).offset();
			    var ow = $(t).width();
			    var oh = $(t).height();

			    $(t).animate({ width: 0, left: "+=" + ow / 2 }, 80, function () {
			        $(t).removeClass("OppHandCard").addClass("HandCard").find(".Beauty").css("background-image", "url(" + imgUrl + ")");
			        $(t).animate({ width: ow, left: "-=" + ow / 2 }, 80);
			    });
			},
			turnToBack: function (callback) {
			    var op = $(t).offset();
			    var ow = $(t).width();
			    var oh = $(t).height();

			    $(t).animate({ width: 0, left: "+=" + ow / 2 }, 80, function () {
			        $(t).removeClass("HandCard").addClass("OppHandCard");
			        $(t).animate({ width: ow, left: "-=" + ow / 2 }, 80);
			        callback();
			    });
			},

			dragStart: function (e) {
				document.oPosition = $(t).offset();
				document.oPosition.right = document.oPosition.left + $(t).width();
				document.oPosition.bottom = document.oPosition.top + $(t).height();
				document.dragPoker = t;
				document.dragPokerIndex = $(".HandCard").index(t);
				document.pokerCopy = $(t).clone().removeClass("HandCard");
				$(document.pokerCopy).css({
                    "z-index":100,
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
					if (e.pageX > document.oPosition.right || e.pageX < document.oPosition.left || e.pageY > document.oPosition.bottom || e.pageY < document.oPosition.top) {
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(document.pokerCopy).css({
						top: e.pageY,
						left: e.pageX,
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
			            var tp = $(".HandCard").eq(document.dragPokerTargetIndex);
			            var tSet = tp.offset();
			            var tz = tp.css("z-index");
			            var op = $(".HandCard").eq(document.dragPokerIndex);
			            var oSet = op.offset();
			            var oz = op.css("z-index");

			            tp.animate({ "z-index": "+=100" }, 10).animate({ top: oSet.top - 5, left: oSet.left - 5 }, 1000).animate({ "z-index": oz }, 10);
			            op.animate({ "z-index": "+=100" }, 10).animate({ top: tSet.top - 5, left: tSet.left - 5 }, 1000).animate({ "z-index": tz }, 10);

			            var tmpFlag = document.createElement("div");
			            $(tmpFlag).hide();
			            op.after($(tmpFlag));
			            tp.after(op);
			            $(tmpFlag).after(tp);
			            $(tmpFlag).remove();

			            Cav.GameController.SwapCards(document.dragPokerTargetIndex, document.dragPokerIndex);
			        } else if (document.clearPokerFlag) {
			            var oCard = $(".HandCard").eq(document.dragPokerIndex);
			            var index = $(".HandCard").index(oCard);
			            var deckPosition = $("#Deck").offset();
			            document.clearPokerList.splice(document.clearPokerList.length, 0,
                            {
                                index: index,
                                position: oCard.offset(),
                                card: oCard,
                                zIndex: oCard.css("z-index")
                            });

			            if (document.clearPokerList.length == 2) {
			                var isMatch = Cav.GameController.DumpMatchedCards(document.clearPokerList[0].index, document.clearPokerList[1].index);
			                if (isMatch) {
			                    oCard.animate({ "z-index": "+=100" }, 10).animate({ top: deckPosition.top - 5, left: deckPosition.left - 5 }, 1000).animate({ "z-index": 1 }, 10).addClass("PreDumpCard", 10).hide(10);
			                    $(".PreDumpCard").addClass("DumpCard").removeClass("PreDumpCard").removeClass("HandCard");

			                    Cav.GameController.DumpMatchedCards(document.clearPokerList[0].index, document.clearPokerList[1].index);
			                } else {
			                    document.clearPokerList[0].card.show(100).animate({ "z-index": "+=100" }, 10).animate({ top: document.clearPokerList[0].position.top - 5, left: document.clearPokerList[0].position.left - 5 }, 1000).animate({ "z-index": document.clearPokerList[0].zIndex }, 10);
			                }
			                document.clearPokerList = [];
			            } else {
			                oCard.animate({ "z-index": "+=100" }, 10).animate({ top: deckPosition.top - 5, left: deckPosition.left - 5 }, 1000).animate({ "z-index": 1 }, 10).addClass("PreDumpCard", 10).hide(10);
			            }
			        }

			        document.dragPoker = null;
			        document.oPosition = null;
			        document.dragPokerIndex = null;
			        document.dragPokerTargetIndex = null;
			        document.pokerCopy = null;
			        document.clearPokerFlag = false;
			    } 

				$('body').css('cursor', 'default');
				$('body').noSelect(false);

				$(document).unbind("mousemove");
			},
		};

	    $(t).click(function () {
	        if (c.locked) return;
			if (!c.moveUpFlag) {
				c.moveUp();
				c.moveUpFlag = true;
				t.cav = c;
            } else {
				c.moveDown();
				c.moveUpFlag = false;
				t.cav = c;
			}
            
			if ($(t).hasClass("OppHandCard")) {
			    var index = $(".OppHandCard").index($(t));
			    Cav.GameController.PickCard(index);
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
		}).mouseleave(function () {
		    if (document.pokerCopy) {
		        document.dragPokerTargetIndex = null;
		    }
		});

	    document.clearPokerFlag = false;
	    document.clearPokerList = [];
	    $("#Deck").mouseenter(function () {
	        document.clearPokerFlag = true;
	    }).mouseleave(function () {
	        document.clearPokerFlag = false;
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
	$.fn.cavPokerMoveTo = function (left, top, speed, callback) {
		return this.each(function () {
		    if (this.cav) this.cav.moveTo(left, top, speed, callback);
		});
	};
	$.fn.cavPokerToggleUpDown = function () {
	    return this.each(function () {
	        if (this.cav) {
	            if (!this.cav.moveUpFlag) {
	                this.cav.moveUp();
	                this.cav.moveUpFlag = true;
	            } else {
	                this.cav.moveDown();
	                this.cav.moveUpFlag = false;
	            }
	        }
	    });
	};
	$.fn.cavPokerMoveUp = function () {
	    return this.each(function () {
	        if (this.cav) this.cav.moveUp();
	    });
	};
	$.fn.cavPokerMoveDown = function () {
	    return this.each(function () {
	        if (this.cav) this.cav.moveDown();
	    });
	};
	$.fn.cavPockerUnlock = function () {
	    return this.each(function () {
	        if (this.cav) this.cav.unlock();
	    });
	};
	$.fn.cavPockerLock = function () {
	    return this.each(function () {
	        if (this.cav) this.cav.lock();
	    });
	};
	$.fn.cavPokerTurnToFront = function (imgUrl) {
	    return this.each(function () {
	        if (this.cav) this.cav.turnToFront(imgUrl);
	    });
	};
	$.fn.cavPokerTurnToBack = function (callback) {
	    return this.each(function () {
	        if (this.cav) this.cav.turnToBack(callback);
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