//var Cav = {};
Cav.BoardAreaId = "board-area";
Cav.PokerTemplateId = "HandCardTemplate";
Cav.PokerSource = [];
Cav.PicMapping = [];
Cav.DealSpeed = 100;
Cav.HandCardBasicPosition = { X: 0, Y: 0 };
Cav.P2HandCardBasicPosition = { X: 0, Y: 0 };
Cav.DeckPosition = { X: 0, Y: 0 };
Cav.GameController = {
    HandCard: [],
    Switch: function (cavMsg) {
        this[cavMsg.FunctionName](cavMsg);
    },
    GameStarted: function (cavMsg) {
        Cav.PicMapping[0] = "images/TmpGirl/Joker.jpg";

        Cav.GameController.HandCards = cavMsg.PokerCards;

        //依據BoardArea的大小及位置決定 發牌的起始位置
        Cav.P2HandCardBasicPosition.X = $("#" + Cav.BoardAreaId).offset().left;
        Cav.P2HandCardBasicPosition.Y = $("#" + Cav.BoardAreaId).offset().top;

        Cav.HandCardBasicPosition.X = $("#" + Cav.BoardAreaId).offset().left;
        Cav.HandCardBasicPosition.Y = $("#" + Cav.BoardAreaId).offset().top + $("#" + Cav.BoardAreaId)[0].offsetHeight - $("#Deck")[0].offsetHeight;

        Cav.DeckPosition.X = $("#" + Cav.BoardAreaId).offset().left + $("#" + Cav.BoardAreaId)[0].offsetWidth - 20 - $("#Deck")[0].offsetWidth;
        Cav.DeckPosition.Y = $("#" + Cav.BoardAreaId).offset().top + ($("#" + Cav.BoardAreaId)[0].offsetHeight - $("#Deck")[0].offsetHeight) / 2;

        $("#Deck").css("left", Cav.DeckPosition.X).css("top", Cav.DeckPosition.Y);

        $("#pick-button").css("left", Cav.DeckPosition.X + ($("#Deck")[0].offsetWidth - $("#pick-button")[0].offsetWidth) / 2)
            .css("top", Cav.DeckPosition.Y - 60);

        $("#ready-button").css("left", Cav.DeckPosition.X + ($("#Deck")[0].offsetWidth - $("#ready-button")[0].offsetWidth) / 2)
                    .css("top", Cav.DeckPosition.Y + $("#Deck")[0].offsetHeight + 30);

        $("#ready-button").click(function () {
            Cav.GameController.ReadyToBePicked();
            $("#ready-button")[0].disabled = true;
        });

        $("#pick-button").click(function () {
            var index = -1;
            $(".OppHandCard").each(function () {
                if (this.cav&&this.cav.moveUpFlag) {
                    index = $(this).index(".OppHandCard");
                }
            });

            Cav.GameController.ConfirmPickCard(index);
            $("#pick-button")[0].disabled = true;
        });

        if (cavMsg.Turn == 0) {
            $("#ready-button")[0].disabled = false;
        }

        //初始 Source
        Cav.PicMapping = cavMsg.PicMapping;
        Cav.PokerSource.push({ Id: 0, No: 0, Suit: 0 });
        for (var id = 1; id <= 26; id++) {
            var no = id % 13;
            var suit = parseInt(id / 13);
            if (no == 0) {
                no = 13;
                suit = suit - 1;
            }

            Cav.PokerSource.push({ Id: id, No: no, Suit: suit });
        }

        var pokerTemplate = $('#' + Cav.PokerTemplateId).html();

        var delayTime = Cav.DealSpeed;
        var positionX = Cav.HandCardBasicPosition.X;
        var p2PositionX = Cav.P2HandCardBasicPosition.X;
        for (var i = 0; i < cavMsg.PokerCards.length; i++) {
            var p2CardLength = 27 - cavMsg.PokerCards.length;
            if (p2CardLength != 14 && i == 0) {
                //如果對手牌數不為14則第一回發牌不發對手的牌
            } else {
                $(document.createElement("div")).appendTo("#" + Cav.BoardAreaId)
                    .cavPoker({
                        Id: -1,
                        No: -1,
                        Suit: -1,
                        handCard: false,
                        pokerTemplate: pokerTemplate,
                        zIndex: i + 1,
                        left: Cav.DeckPosition.X,
                        top: Cav.DeckPosition.Y
                    }).cavPokerMoveTo(p2PositionX, Cav.P2HandCardBasicPosition.Y, delayTime);

                delayTime += Cav.DealSpeed;
                p2PositionX += ($("#Deck")[0].offsetWidth / 3);
            }

            var id = cavMsg.PokerCards[i];
            var card = Cav.PokerSource[id];

            $(document.createElement("div")).appendTo("#" + Cav.BoardAreaId)
                .cavPoker({
                    Id: card.Id,
                    No: card.No,
                    Suit: card.Suit,
                    handCard: true,
                    ImgUrl: cavMsg.PicMapping[card.No],
                    pokerTemplate: pokerTemplate,
                    zIndex: i + 1,
                    left: Cav.DeckPosition.X,
                    top: Cav.DeckPosition.Y
                }).cavPokerMoveTo(positionX, Cav.HandCardBasicPosition.Y, delayTime, function () {
                    $(this).cavPockerUnlock();
                });

            delayTime += Cav.DealSpeed;
            positionX += ($("#Deck")[0].offsetWidth / 3);

            if (p2CardLength == 14 && i == 12) {
                //如果對手牌數為14則多發一張
                $(document.createElement("div")).appendTo("#" + Cav.BoardAreaId)
                    .cavPoker({
                        Id: -1,
                        No: -1,
                        Suit: -1,
                        handCard: false,
                        pokerTemplate: pokerTemplate,
                        zIndex: i + 1,
                        left: Cav.DeckPosition.X,
                        top: Cav.DeckPosition.Y
                    }).cavPokerMoveTo(p2PositionX, Cav.P2HandCardBasicPosition.Y, delayTime);

                delayTime += Cav.DealSpeed;
                p2PositionX += ($("#Deck")[0].offsetWidth / 3);
            }
        }
    }
};

// 送出訊息-------------------------------
Cav.GameController.ReadyToBePicked = function () {
    Cav.submitMovement({
        FunctionName: 'OpponentReady',
        Turn: null,
        PokerCards: [],
        PicMapping: [],
        Index1: null,
        Index2: null
    });
};

Cav.GameController.PickCard = function (index) {
    Cav.submitMovement({
        FunctionName: 'ReceivedPickCard',
        Turn: null,
        PokerCards: [],
        PicMapping: [],
        Index1: index,
        Index2: null
    });
};

Cav.GameController.ConfirmPickCard = function (index) {
    Cav.submitMovement({
        FunctionName: 'ReceivedConfirmPickCard',
        Turn: null,
        PokerCards: [],
        PicMapping: [],
        Index1: index,
        Index2: null
    });
};

// 牌被抽了之後送出
Cav.GameController.SendPickedCard = function (index, cardId) {
    Cav.submitMovement({
        FunctionName: 'ReceivedCard',
        Turn: null,
        PokerCards: [cardId],
        PicMapping: [],
        Index1: index,
        Index2: null
    });

};

Cav.GameController.SwapCards = function (index1, index2) {
    // 抽出插入的理牌方式...不要想歪
    //var temp = Cav.GameController.HandCards.splice(index1, 1);
    //Cav.GameController.HandCards.splice(index2, 0, temp);

    // 單純swap
    var temp = Cav.GameController.HandCards[index1];
    Cav.GameController.HandCards[index1] = Cav.GameController.HandCards[index2];
    Cav.GameController.HandCards[index2] = Cav.GameController.HandCards[index1];

    Cav.submitMovement({
        FunctionName: 'ReceivedSwap',
        Turn: null,
        PokerCards: [],
        PicMapping: [],
        Index1: index1,
        Index2: index2
    });
};

// 清牌, 成功return true
Cav.GameController.DumpMatchedCards = function (index1, index2) {

    // 判斷牌有沒有成對
    if (Math.abs(Cav.GameController.HandCards[index1] - Cav.GameController.HandCards[index2]) === 13) {
        if (index1 > index2) {
            Cav.GameController.HandCards.splice(index1, 1);
            Cav.GameController.HandCards.splice(index2, 1);
        }
        else {
            Cav.GameController.HandCards.splice(index2, 1);
            Cav.GameController.HandCards.splice(index1, 1);
        }
        /*
        Cav.submitMovement({
            FunctionName: 'ReceivedDump',
            Turn: null,
            PokerCards: [Cav.GameController.HandCards[index1], Cav.GameController.HandCards[index2]],
            PicMapping: [],
            Index1: index1,
            Index2: index2
        });
        */
        if (Cav.GameController.HandCards.length === 0) {
            Cav.Winning();
        }

        return true;
    }
    else {
        return false;
    }
};

// 獲勝時送出
Cav.GameController.Winning = function () {
    Cav.submitMovement({
        FunctionName: 'YouLose',
        Turn: null,
        PokerCards: [],
        PicMapping: [],
        Index1: null,
        Index2: null
    });

    // call獲勝動畫

};

//--------------------------------------------------------

// 接收訊息-------------------------------------
Cav.GameController.OpponentReady = function () {
    // 通知本機可以抽牌了
    alert("Opp Ready");
    $(".OppHandCard").cavPockerUnlock();
    $("#pick-button")[0].disabled = false;
};

Cav.GameController.ReceivedPickCard = function (cavMsg) {
    var c = $(".HandCard").eq(cavMsg.Index1);
    c.cavPokerToggleUpDown();
};

// 被抽走一張
Cav.GameController.ReceivedConfirmPickCard = function (cavMsg) {
    var pickedCard = Cav.GameController.HandCards.splice(cavMsg.Index1, 1);

    //抽牌動畫
    var c1 = $(".HandCard").eq(cavMsg.Index1);
    c1.css("z-index", "+=100");

    var oppCardCount = $(".OppHandCard").length;
    c1.cavPokerMoveTo(Cav.P2HandCardBasicPosition.X + (oppCardCount - 1) * ($("#Deck")[0].offsetWidth / 3), Cav.P2HandCardBasicPosition.Y, 1000, function () {
        c1.cavPokerTurnToBack(function () {
            Cav.GameController.SendPickedCard(cavMsg.Index1, pickedCard);

            $(".HandCard").each(function () {
                var index = $(this).index(".HandCard");
                $(this).delay(100).animate({ left: Cav.HandCardBasicPosition.X + index * ($("#Deck")[0].offsetWidth / 3) }, 100);
            });

            if (Cav.GameController.HandCards.length === 0) {
                Cav.Winning();
            }
        });
    });
};

// 拿到抽到的牌
Cav.GameController.ReceivedCard = function (cavMsg) {

    Cav.GameController.HandCards.push(cavMsg.PokerCards[0]);

    var index = cavMsg.index1;
    var id = cavMsg.PokerCards[0];
    var no = id > 13?id-13:id;
    var imgUrl = Cav.PicMapping[no];
    var c = $(".OppHandCard").eq(index);

    var handCardCount = $(".HandCard").length;

    c.cavPokerMoveDown(function () {
        c.cavPokerMoveTo(Cav.HandCardBasicPosition.X + (handCardCount - 1) * ($("#Deck")[0].offsetWidth / 3), Cav.HandCardBasicPosition.Y, 1000, function () {
            c.cavPokerTurnToFront(imgUrl, function () {
                $(".OppHandCard").each(function () {
                    var index = $(this).index(".OppHandCard");
                    $(this).delay(100).animate({ left: Cav.P2HandCardBasicPosition.X + index * ($("#Deck")[0].offsetWidth / 3) }, 100, function () {
                        $("#ready-button")[0].disabled = false;
                    });
                });
            });
        });
    });
};

// 收到對方交換牌的位置
Cav.GameController.ReceivedSwap = function (cavMsg) {
    //$(".OppHandCard").eq(cavMsg.Index1).cavPokerSwap(index1, index2);

    var tp = $(".OppHandCard").eq(cavMsg.Index1);
    var tSet = tp.offset();
    var tz = tp.css("z-index");
    var op = $(".OppHandCard").eq(cavMsg.Index2);
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
};

// 收到對方清掉的牌
Cav.GameController.ReceivedDump = function (cavMsg) {
    var imgUrl = Cav.Pic
    var c1 = $(".OppHandCard").eq(cavMsg.Index1);
    var c2 = $(".OppHandCard").eq(cavMsg.Index2);
    // 對方清掉牌的動畫rd").eq(cavMsg.Index2);
    c1.css("z-index", "+=100").cavPokerTurnToFront(imgUrl);
    c2.css("z-index", "+=100").cavPokerTurnToFront(imgUrl);

    c1.delay(1000).cavPokerMoveTo(Cav.DeckPosition.X, Cav.DeckPosition.Y, 1000)
        .animate({ "z-index": 1 }, 10)
        .addClass("PreDumpCard", 10)
        .hide(10)
        .addClass("DumpCard")
        .removeClass("PreDumpCard")
        .removeClass("HandCard");

    c2.delay(2000).cavPokerMoveTo(Cav.DeckPosition.X, Cav.DeckPosition.Y, 1000)
        .addClass("PreDumpCard", 10)
        .hide(10)
        .addClass("DumpCard")
        .removeClass("PreDumpCard")
        .removeClass("HandCard")
        .animate({ "z-index": 1 }, 10);

    $(".OppHandCard").each(function () {
        var index = $(this).index(".OppHandCard");
        $(this).animate({ left: Cav.P2HandCardBasicPosition.X + index * ($("#Deck")[0].offsetWidth / 3) }, 10);
    });
};

Cav.GameController.YouLose = function () {
    // call輸了的動畫
   //$("").cavPokerScale();
};