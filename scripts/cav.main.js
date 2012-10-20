$(function () {
    $('#players').hide();
    $('#rooms').hide();
});

$(document).ready(function () {
    $('#login_dialog').dialog({
        autoOpen: true,
        draggable: false,
        modal: true,
        title: 'Connect to XMPP',
        buttons: {
            "Connect": function () {
                $(document).trigger('connect', {
                    jid: $('#jid').val().toLowerCase(),
                    password: $('#password').val(),
                    referee: $('#referee').val().toLowerCase()
                });

                $('#password').val('');
                $(this).dialog('close');
            }
        }
    });

    $('#disconnect').click(function () {
        $(this).attr('disabled', 'disabled');

        Cav.connection.disconnect();
    });

    $('#wait').click(function () {
        $(this).attr('disabled', 'disabled');

        Cav.connection.sendIQ(
            $iq({ to: Cav.referee, type: "set" })
                .c("waiting", { xmlns: Cav.NS_CAV }));
    });

     //test CavMsg conversion
    $('#sendCavMsg').click(function () {
        Cav.game = $(this).parent().prev().text();
        Cav.watching = true;

        $('#browser').hide();
        $('#game').show();
        $('#chat').css({ left: $("html").width(), opacity: 0.4 });
        Cav.Animation.showChat();
        Cav.Animation.hideChat();
        //Cav.draw_board();
        $('#board-status').html('');

        Cav.GameController.Switch({
            FunctionName: 'GameStarted',
            Turn: 1,
            PokerCards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 26],
            PicMapping: ["images/TmpGirl/Joker.jpg", "images/TmpGirl/Beauty01.jpg", "images/TmpGirl/Beauty02.jpg", "images/TmpGirl/Beauty03.jpg", "images/TmpGirl/Beauty04.jpg", "images/TmpGirl/Beauty05.jpg", "images/TmpGirl/Beauty06.jpg", "images/TmpGirl/Beauty07.jpg", "images/TmpGirl/Beauty08.jpg", "images/TmpGirl/Beauty09.jpg", "images/TmpGirl/Beauty10.jpg", "images/TmpGirl/Beauty11.jpg", "images/TmpGirl/Beauty12.jpg", "images/TmpGirl/Beauty13.jpg"],
            Index1: 3,
            Index2: 2
        });
    });
    $('#getCavMsg').click(function () {
        Cav.GameController.Switch({
            FunctionName: 'ReceivedDump',
            Turn: null,
            PokerCards: [2, 15],
            PicMapping: [],
            Index1: 3,
            Index2: 2
        });
    });

    // test show/hide
    $('#show').click(function () {
        Cav.Animation.showWaitingList(Cav.Animation.showGameList());
    });
    $('#hide').click(function () {
        Cav.Animation.hideGameList(Cav.Animation.hideWaitingList());
    });

    $('input.stop_button').live('click', function () {
        Cav.connection.sendIQ(
            $iq({ to: Cav.referee, type: "set" })
                .c('stop-waiting', { xmlns: Cav.NS_CAV }),
            function () {
                $('#wait').removeAttr('disabled');
            });
    });

    $('input.start_button').live('click', function () {
        Cav.connection.sendIQ(
            $iq({ to: Cav.referee, type: "set" })
                .c('start', {
                    xmlns: Cav.NS_CAV,
                    "with": $(this).parent().prev().text()
                }));
    });

    $('input.watch_button').live('click', function () {
        // join the game room
        Cav.game = $(this).parent().prev().text();
        Cav.watching = true;

        $('#browser').hide();
        $('#game').show();
        Cav.draw_board();
        $('#board-status').html('');

        Cav.connection.send(
            $pres({ to: Cav.game + '/' + Cav.connection.jid }));
    });

    $('#input').keypress(function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();

            var input = $(this).val();
            $(this).val('');

            Cav.connection.send(
                $msg({ to: Cav.game, type: 'groupchat' })
                    .c('body').t(input));
        }
    });

    $('#resign').click(function () {
        Cav.connection.sendIQ(
            $iq({ to: Cav.referee, type: 'set' })
                .c('resign', { xmlns: Cav.NS_CAV }));
    });

    $('#leave').click(function () {
        Cav.connection.send(
            $pres({
                to: Cav.game + '/' + Cav.connection.jid,
                type: 'unavailable'
            }));
        $('#game').hide();
        $('#browser').show();
    });

    $('#chat').mouseover(function () {
            $('#chat').stop();
            Cav.Animation.showChat();
    });

    $('#chat').mouseleave(function () {
            $('#chat').stop();
            Cav.Animation.hideChat();
    });

    //    $('#board').click(function (ev) {
    //        if (Cav.turn && Cav.turn === Cav.my_side) {
    //            var pos = $(this).position();
    //            var x = Math.floor((ev.pageX - pos.left) / 100);
    //            var y = Math.floor((ev.pageY - pos.top) / 100);

    //            Cav.connection.sendIQ(
    //                $iq({ to: Cav.referee, type: 'set' })
    //                    .c('move', { xmlns: Cav.NS_CAV,
    //                        col: ['a', 'b', 'c'][x],
    //                        row: y + 1
    //                    }));
    //        }
    //    });
});

$(document).bind('connect', function (ev, data) {
    var conn = new Strophe.Connection(
        "http://bosh.metajack.im:5280/xmpp-httpbind");

    // debug
    conn.rawInput = function (data) {
        console.log(data);
    };
    conn.rawOutput = function (data) {
        console.log(data);
    };

    conn.connect(data.jid, data.password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $(document).trigger('connected');
        } else if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
        }
    });

    Cav.connection = conn;
    Cav.referee = data.referee;
});

$(document).bind('connected', function () {
    $('#disconnect').removeAttr('disabled');
    $('#wait').removeAttr('disabled');

    Cav.Animation.showWaitingList(
    Cav.Animation.showGameList());

    Cav.connection.addHandler(Cav.on_message, null, "message");

    // tell the referee we're online
    Cav.connection.send(
        $pres({ to: Cav.referee })
            .c('register', { xmlns: Cav.NS_CAV }));
});

$(document).bind('disconnected', function () {
    Cav.referee = null;
    Cav.connection = null;

    Cav.Animation.hideGameList(Cav.Animation.hideWaitingList());
    $('#waiting tbody').empty();
    $('#games tbody').empty();

    $('#login_dialog').dialog('open');
});