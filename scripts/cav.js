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
        if (cmdNode.length > 0) {
            cmd = cmdNode.get(0).tagName;
        }

        if (cmd === 'move') {
            return {
                functionName: cmdNode.attr('functionName'),
                turn: cmdNode.attr('turn'),
                pokerCards: cmdNode.attr('pokerCards').split(' '),
                picMapping: cmdNode.attr('picMapping').split(' '),
                index1: cmdNode.attr('index1'),
                index2: cmdNode.attr('index2')
            };
        }
        else {
            return {};
        }
    },

    // convert CavMsg to XMPP iq stanza and send it to the server
    submitMovement: function (cavMsg) {
        Cav.connection.sendIQ($iq({ to: Cav.referee, type: 'set' })
                            .c('move', {
                                xmlns: Cav.NS_CAV,
                                functionName: cavMsg.functionName,
                                turn: cavMsg.turn,
                                pokerCards: cavMsg.pokerCards.join(' '),
                                picMapping: cavMsg.picMapping.join(' '),
                                index1: cavMsg.index1,
                                index2: cavMsg.index2
                            }));
    }

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

    // test CavMsg conversion
    $('#sendCavMsg').click(function () {
        Cav.submitMovement({
            functionName: 'test',
            turn: 1,
            pokerCards: [1, 2],
            picMapping: ['http://google.com', 'http://yahoo.com'],
            index1: 3,
            index2: 2
        });
    });
    $('#getCavMsg').click(function () {
        var testCav = Cav.convertGameMessage("<message to='elizabeth@longbourn.lit/sitting_room' from='toetem-789@games.pemberley.lit/referee' type='groupchat'><move xmlns='https://github.com/begeeben/Comment-allez-vous' functionName='test' turn=1 pokerCards='1 2' picMapping='http://google.com http://yahoo.com' index1=3 index2=2/></message>");
        return true;
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
