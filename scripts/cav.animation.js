Cav.Animation = {

    animationDuration: 600,
    delay: 550,

    hideWaitingList: function () {

        var $that = $('#players');

        $that.css({ position: 'absolute', top: 0 })
                .animate({ left: '-=640', opacity: 0 }, {
                    duration: animationDuration,
                    complete: function () {
                        $that.element.css({ position: 'relative' });
                        $that.element.hide();
                    }
                });
    },

    showWaitingList: function () {
        var $that = $('#players');

        $that.removeClass('empty')
                .css({ left: 900, opacity: 0, position: 'relative' })
                .show()
                .delay(delayLength)
                .animate({ left: '-=640', opacity: 1 }, animationDuration);
    },

    hideGameList: function () {
        $('#rooms')
    },

    showGameList: function () {
    },

    hideChat: function () {
        $('#chat')
    },

    showChat: function () {
    },

    hideLoginDialog: function () {
        $('#login_dialog')
    },

    showLoginDialog: function () {
    }

};