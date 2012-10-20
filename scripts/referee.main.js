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
                    password: $('#password').val()
                });

                $('#password').val('');
                $(this).dialog('close');
            }
        }
    });
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

    Referee.connection = conn;
});

$(document).bind('connected', function () {
    var conn = Referee.connection;

    $('#log').prepend("<p>Connected as " + conn.jid + "</p>");

    conn.addHandler(Referee.on_presence, null, "presence");
    conn.addHandler(Referee.on_iq, null, "iq");

    conn.send($pres());
});