var Cav = {
    connection: null,
    referee: null,
    NS_CAV: "https://github.com/begeeben/Comment-allez-vous",
    NS_MUC: "http://jabber.org/protocol/muc",
    game: null,
    x_player: null,
    o_player: null,
    turn: null,
    my_side: null,
    watching: false,

    on_message: function (message) {
        var from = $(message).attr('from');

        if ($(message).find('waiting').length > 0) {
            // received players added into waiting list
            $(message).find('waiting > player').each(function () {
                $('#waiting tbody').append(
                        "<tr><td class='jid'>" +
                            $(this).attr('jid') +
                            "</td><td>" +
                            ($(this).attr('jid') === Cav.connection.jid ?
                             "<input type='button' class='stop_button' " +
                             "value='stop waiting'>" :
                             "<input type='button' class='start_button' " +
                             "value='start game'>") +
                            "</td></tr>");
            });
        } else if ($(message).find('not-waiting').length > 0) {
            // received players removed from waiting list
            $(message).find('not-waiting > player').each(function () {
                var jid = $(this).attr('jid');
                $('#waiting td.jid').each(function () {
                    if ($(this).text() === jid) {
                        $(this).parent().remove();
                        return false;
                    }
                });
            });
        } else if ($(message).find('games').length > 0) {
            // received current playing game list
            $(message).find('games > game').each(function () {
                if ($(this).attr('x-player') !== Cav.connection.jid &&
                    $(this).attr('o-player') !== Cav.connection.jid) {
                    $('#games tbody').append(
                        "<tr><td>" +
                            $(this).attr('x-player') +
                            "</td><td>" +
                            $(this).attr('o-player') +
                            "</td><td class='jid'>" +
                            $(this).attr('room') +
                            "</td><td>" +
                            "<input type='button' class='watch_button' " +
                            "value='watch game'>" +
                            "</td></tr>");
                }
            });
        } else if ($(message).find('game-over').length > 0) {
            // received finished game list
            $(message).find('game-over > game').each(function () {
                var jid = $(this).attr('room');
                $('#games td.jid').each(function () {
                    if ($(this).text() === jid) {
                        $(this).parent().remove();
                        return false;
                    }
                });
            });
        } else if ($(message)
                   .find('x > invite').attr('from') &&
                   Strophe.getBareJidFromJid($(message)
                                             .find('x > invite')
                                             .attr('from')) ===
                   Strophe.getBareJidFromJid(Cav.referee)) {
            // received game invitation
            Cav.game = from;
            Cav.watching = false;

            $('#messages').empty();
            $('#messages').append("<div class='system'>" +
                                  "Joined game #" +
                                  Strophe.getNodeFromJid(from) +
                                  "</div>");
            Cav.scroll_chat();

            $('#wait').removeAttr('disabled');
            $('#browser').hide();
            $('#game').show();
            Cav.draw_board();
            $('#board-status').html('Waiting for other player...');

            var nick = Cav.connection.jid;
            //            nick = nick.substring(0, nick.indexOf('@'));

            Cav.connection.send(
                $pres({ to: Cav.game + '/' + nick })
                    .c('x', { xmlns: Cav.NS_MUC }));
        } else {
            // in game messages

            // display text message
            var body = $(message).children('body').text();
            if (body) {
                var who = Strophe.getResourceFromJid(from);
                var nick_style = 'nick';
                if (who === Cav.connection.jid) {
                    nick_style += ' me';
                }

                $('#messages').append(
                    "<div>&lt;<span class='" + nick_style + "'>" +
                        Strophe.getBareJidFromJid(from) +
                        "</span>&gt; " +
                        body + "</div>");

                Cav.scroll_chat();
            }

            if ($(message).find('delay').length > 0) {
                // skip command processing of old messages
                return true;
            }

            // handle game messages
            // convert message to CavMsg
            var cavMsg = Cav.convertGameMessage(message);
            // call game logic handler


            //            if (cmd === 'game-started') {
            //            // when game started
            //                var me = Cav.connection.jid;
            //                Cav.x_player = cmdNode.attr('x-player');
            //                Cav.o_player = cmdNode.attr('o-player');
            //                Cav.turn = 'x';

            //                if (Cav.x_player === me) {
            //                    Cav.my_side = 'x';
            //                    $('#board-status').html('Your move...');
            //                } else if (Cav.o_player === me) {
            //                    Cav.my_side = 'o';
            //                    $('#board-status').html("Opponent's move...");
            //                }

            //                if (!Cav.watching) {
            //                    $('#resign').removeAttr('disabled');
            //                } else {
            //                    $('#leave').removeAttr('disabled');
            //                }
            //            } else if (cmd === 'game-ended') {
            //            // when game ended
            //                $('#resign').attr('disabled', 'disabled');
            //                $('#leave').removeAttr('disabled');
            //                var winner = cmdNode.attr('winner');
            //                if (winner === Cav.connection.jid) {
            //                    $('#board-status').html('You won!');
            //                } else if (winner && !Cav.watching) {
            //                    $('#board-status').html('You lost!');
            //                } else if (!Cav.watching) {
            //                    $('#board-status').html('You tied!');
            //                }
            //            } else if (cmd === 'move') {
            //                var map = { 'a': 0, 'b': 1, 'c': 2, '1': 0, '2': 1, '3': 2 };
            //                col = cmdNode.attr('col');
            //                row = cmdNode.attr('row');

            //                Cav.draw_piece(Cav.turn, map[col], map[row]);

            //                if (Cav.turn === 'x') {
            //                    Cav.turn = 'o';
            //                } else {
            //                    Cav.turn = 'x';
            //                }

            //                if (!Cav.watching) {
            //                    Cav.my_turn = Cav.turn === Cav.my_side;

            //                    if (Cav.my_turn) {
            //                        $('#board-status').html("Your move...");
            //                    } else {
            //                        $('#board-status').html("Opponent's move...");
            //                    }
            //                }
            //            } else if (cmd === 'game-state') {
            //                var pos = cmdNode.attr('pos');
            //                if (pos) {
            //                    var idx = 0;
            //                    for (row = 0; row < 3; row++) {
            //                        for (col = 0; col < 3; col++) {
            //                            if (pos[idx] !== ' ') {
            //                                Cav.draw_piece(pos[idx], col, row);
            //                            }

            //                            idx += 1;
            //                        }
            //                    }
            //                }
            //            }
        }

        return true;
    },

    scroll_chat: function () {
        var div = $('#messages').get(0);
        div.scrollTop = div.scrollHeight;
    },

    // convert XMPP game logic message stanza to CavMsg
    convertGameMessage: function (message) {
        var cmdNode = $(message)
                .find('*[xmlns="' + Cav.NS_CAV + '"]');
        var cmd = null;
        var row, col;
        if (cmdNode.length > 0) {
            cmd = cmdNode.get(0).tagName;
        }

        return {
            functionName: cmd
        };
    },

    // convert CavMsg to XMPP iq stanza and send it to the server
    submitMovement: function (cavMsg) {
    }

    //    draw_board: function () {
    //        var ctx = $('#board')[0].getContext('2d');

    //        // clear board
    //        ctx.fillStyle = '#000';
    //        ctx.beginPath();
    //        ctx.fillRect(0, 0, 300, 300);

    //        // draw grid lines
    //        ctx.strokeStyle = '#999';
    //        ctx.lineWidth = 4;

    //        ctx.beginPath();

    //        ctx.moveTo(100, 10);
    //        ctx.lineTo(100, 290);
    //        ctx.moveTo(200, 10);
    //        ctx.lineTo(200, 290);
    //        ctx.moveTo(10, 100);
    //        ctx.lineTo(290, 100);
    //        ctx.moveTo(10, 200);
    //        ctx.lineTo(290, 200);

    //        ctx.stroke();
    //    },

    //    draw_piece: function (piece, x, y) {
    //        var ctx = $('#board')[0].getContext('2d');

    //        ctx.strokeStyle = '#fff';

    //        var center_x = (x * 100) + 50;
    //        var center_y = (y * 100) + 50;

    //        ctx.beginPath();

    //        if (piece === 'x') {
    //            ctx.moveTo(center_x - 15, center_y - 15);
    //            ctx.lineTo(center_x + 15, center_y + 15);

    //            ctx.moveTo(center_x + 15, center_y - 15);
    //            ctx.lineTo(center_x - 15, center_y + 15);
    //        } else {
    //            ctx.arc(center_x, center_y, 15, 0, 2 * Math.PI, true);
    //        }

    //        ctx.stroke();
    //    }
};

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
                .c('start', { xmlns: Cav.NS_CAV,
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
            $pres({ to: Cav.game + '/' + Cav.connection.jid,
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
