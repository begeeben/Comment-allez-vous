Cav.Animation = {

    animationDuration: 600,
    delay: 550,

    hideWaitingList: function () {

        $('#players').hide('drop', {}, Cav.Animation.animationDuration);
        //var $that = $('#players');

        //$that.css({ position: 'absolute', top: 0 })
        //        .animate({ left: '-=640', opacity: 0 }, {
        //            duration: animationDuration,
        //            complete: function () {
        //                $that.element.css({ position: 'relative' });
        //                $that.element.hide();
        //            }
        //        });
    },

    showWaitingList: function () {

        $('#players').show('drop', {}, Cav.Animation.animationDuration);
        //var $that = $('#players');

        //$that.removeClass('empty')
        //        .css({ left: 900, opacity: 0, position: 'relative' })
        //        .show()
        //        .delay(delayLength)
        //        .animate({ left: '-=640', opacity: 1 }, animationDuration);
    },

    hideGameList: function () {
        $('#rooms').hide('drop', {}, Cav.Animation.animationDuration);
    },

    showGameList: function () {
        $('#rooms').show('drop', {}, Cav.Animation.animationDuration);
    },

    hideChat: function () {
        $('#chat').hide('drop', {}, Cav.Animation.animationDuration);
    },

    showChat: function () {
        $('#chat').show('drop', {}, Cav.Animation.animationDuration);
    },

    hideLoginDialog: function () {
        $('#login_dialog').hide('drop', {}, Cav.Animation.animationDuration);
    },

    showLoginDialog: function () {
        $('#login_dialog').show('drop', {}, Cav.Animation.animationDuration);
    }

};