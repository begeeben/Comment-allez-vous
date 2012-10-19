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

    // test CavMsg conversion
    $('#sendCavMsg').click(function () {
        Cav.game = $(this).parent().prev().text();
        Cav.watching = true;

        $('#browser').hide();
        $('#game').show();
        //Cav.draw_board();
        $('#board-status').html('');

        Cav.GameController.Switch({
            FunctionName: 'GameStarted',
            Turn: 1,
            PokerCards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            PicMapping: ["images/TmpGirl/Joker.jpg", "images/TmpGirl/Beauty01.jpg", "images/TmpGirl/Beauty02.jpg", "images/TmpGirl/Beauty03.jpg", "images/TmpGirl/Beauty04.jpg", "images/TmpGirl/Beauty05.jpg", "images/TmpGirl/Beauty06.jpg", "images/TmpGirl/Beauty07.jpg", "images/TmpGirl/Beauty08.jpg", "images/TmpGirl/Beauty09.jpg", "images/TmpGirl/Beauty10.jpg", "images/TmpGirl/Beauty11.jpg", "images/TmpGirl/Beauty12.jpg", "images/TmpGirl/Beauty13.jpg"],
            Index1: 3,
            Index2: 2
        });
        //Cav.submitMovement({
        //    functionName: 'test',
        //    turn: 1,
        //    pokerCards: [1, 2,3,4,5,6,7,8,9,10,11,12,13],
        //    picMapping: ["images/TmpGirl/Joker.jpg", "images/TmpGirl/Beauty01.jpg", "images/TmpGirl/Beauty02.jpg", "images/TmpGirl/Beauty03.jpg", "images/TmpGirl/Beauty04.jpg", "images/TmpGirl/Beauty05.jpg", "images/TmpGirl/Beauty06.jpg", "images/TmpGirl/Beauty07.jpg", "images/TmpGirl/Beauty08.jpg", "images/TmpGirl/Beauty09.jpg", "images/TmpGirl/Beauty10.jpg", "images/TmpGirl/Beauty11.jpg", "images/TmpGirl/Beauty12.jpg", "images/TmpGirl/Beauty13.jpg"],
        //    index1: 3,
        //    index2: 2
        //});
    });
    $('#getCavMsg').click(function () {
        //var testCav = Cav.convertGameMessage("<message to='elizabeth@longbourn.lit/sitting_room' from='toetem-789@games.pemberley.lit/referee' type='groupchat'><move xmlns='https://github.com/begeeben/Comment-allez-vous' functionName='test' turn=1 pokerCards='1 2' picMapping='http://google.com http://yahoo.com' index1=3 index2=2/></message>");
        //return true;
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

    Cav.connection.addHandler(Cav.on_message, null, "message");

    // tell the referee we're online
    Cav.connection.send(
        $pres({ to: Cav.referee })
            .c('register', { xmlns: Cav.NS_CAV }));
});

$(document).bind('disconnected', function () {
    Cav.referee = null;
    Cav.connection = null;

    $('#waiting tbody').empty();
    $('#games tbody').empty();

    $('#login_dialog').dialog('open');
});