Cav.Animation = {

    animationDuration: 600,
    delay: 550,
    effectType: 'drop',

    hideWaitingList: function (callback) {

        $('#players').hide(Cav.Animation.effectType, {}, Cav.Animation.animationDuration, callback);
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

    showWaitingList: function (callback) {

        $('#players').show(Cav.Animation.effectType, {}, Cav.Animation.animationDuration, callback);
        //var $that = $('#players');

        //$that.removeClass('empty')
        //        .css({ left: 900, opacity: 0, position: 'relative' })
        //        .show()
        //        .delay(delayLength)
        //        .animate({ left: '-=640', opacity: 1 }, animationDuration);
    },

    hideGameList: function (callback) {
        $('#rooms').hide(Cav.Animation.effectType, {}, Cav.Animation.animationDuration, callback);
    },

    showGameList: function (callback) {
        $('#rooms').show(Cav.Animation.effectType, {}, Cav.Animation.animationDuration, callback);
    },

    hideChat: function (callback) {
        $('#chat').hide('drop', {}, Cav.Animation.animationDuration, callback);
    },

    showChat: function (callback) {
        $('#chat').show('drop', {}, Cav.Animation.animationDuration, callback);
    },

    hideLoginDialog: function (callback) {
        $('#login_dialog').hide('drop', {}, Cav.Animation.animationDuration, callback);
    },

    showLoginDialog: function (callback) {
        $('#login_dialog').show('drop', {}, Cav.Animation.animationDuration, callback);
    }

};