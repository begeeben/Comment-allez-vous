var Cav = {
    connection: null,
    referee: null,
    NS_CAV: "https://github.com/begeeben/Comment-allez-vous",
    NS_MUC: "http://jabber.org/protocol/muc",
    game: null,
    player1: null,
    player2: null,
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
                if ($(this).attr('player1') !== Cav.connection.jid &&
                    $(this).attr('player2') !== Cav.connection.jid) {
                    $('#games tbody').append(
                        "<tr><td>" +
                            $(this).attr('player1') +
                            "</td><td>" +
                            $(this).attr('player2') +
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
            $('#chat').css({ left: $("html").width(), opacity: 0.4 });
            Cav.Animation.showChat();
            Cav.Animation.hideChat();
            //Cav.draw_board();
            $('#board-status').html('Waiting for other player...');

            var nick = Cav.connection.jid;
            nick = nick.substring(0, nick.indexOf('@'));

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
            Cav.GameController.Switch(cavMsg);

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

        if (cmd === 'move' || cmd === 'game-started') {
            return {
                FunctionName: cmdNode.attr('functionname'),
                Turn: cmdNode.attr('turn'),
                PokerCards: cmdNode.attr('pokercards').split(' '),
                PicMapping: cmdNode.attr('picmapping').split(' '),
                Index1: cmdNode.attr('index1'),
                Index2: cmdNode.attr('index2')
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
                                FunctionName: cavMsg.FunctionName,
                                Turn: cavMsg.Turn,
                                PokerCards: cavMsg.PokerCards.join(' '),
                                PicMapping: cavMsg.PicMapping.join(' '),
                                Index1: cavMsg.Index1,
                                Index2: cavMsg.Index2
                            }));
    }

};
