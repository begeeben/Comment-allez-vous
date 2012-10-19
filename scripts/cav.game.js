//var Cav = {};
Cav.BoardAreaId = "board-area";
Cav.PokerTemplateId = "HandCardTemplate";
Cav.PokerSource = [];
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

        Cav.GameController.HandCards = cavMsg.PokerCards;

        //依據BoardArea的大小及位置決定 發牌的起始位置
        Cav.P2HandCardBasicPosition.X = $("#" + Cav.BoardAreaId).offset().left;
        Cav.P2HandCardBasicPosition.Y = $("#" + Cav.BoardAreaId).offset().top;

        Cav.HandCardBasicPosition.X = $("#" + Cav.BoardAreaId).offset().left;
        Cav.HandCardBasicPosition.Y = $("#" + Cav.BoardAreaId).offset().top + $("#" + Cav.BoardAreaId)[0].offsetHeight - $(".Poker")[0].offsetHeight;

        Cav.DeckPosition.X = $("#" + Cav.BoardAreaId).offset().left + $("#" + Cav.BoardAreaId)[0].offsetWidth - 20 - $(".Poker")[0].offsetWidth;
        Cav.DeckPosition.Y = $("#" + Cav.BoardAreaId).offset().top + ($("#" + Cav.BoardAreaId)[0].offsetHeight - $(".Poker")[0].offsetHeight) / 2;

        $(".DeckPosition").css("left", Cav.DeckPosition.X).css("top", Cav.DeckPosition.Y);

        //初始 Source
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
                p2PositionX += ($(".Poker")[0].offsetWidth / 3);
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
            positionX += ($(".Poker")[0].offsetWidth / 3);

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
                p2PositionX += ($(".Poker")[0].offsetWidth / 3);
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
    if (abs(Cav.GameController.HandCards[index1] - Cav.GameController.HandCards[index2]) === 13) {
        if (index1 > index2) {
            Cav.GameController.HandCards.splice(index1, 1);
            Cav.GameController.HandCards.splice(index2, 1);
        }
        else {
            Cav.GameController.HandCards.splice(index2, 1);
            Cav.GameController.HandCards.splice(index1, 1);
        }

        Cav.submitMovement({
            FunctionName: 'ReceivedDump',
            Turn: null,
            PokerCards: [Cav.GameController.HandCards[index1], Cav.GameController.HandCards[index2]],
            PicMapping: [],
            Index1: index1,
            Index2: index2
        });

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

};

Cav.GameController.ReceivedPickCard = function (cavMsg) {
    $(".HandCard").eq(cavMsg.Index1).cavPokerMoveUp();
};

// 被抽走一張
Cav.GameController.ReceivedConfirmPickCard = function (cavMsg) {

    //$(".HandCard").eq(cavMsg.Index1).xxxxxxxxxxxxxxx();

    var pickedCard = Cav.GameController.HandCards.splice(cavMsg.Index1, 1);

    Cav.GameController.SendPickedCard(cavMsg.Index1, pickedCard);

    if (Cav.GameController.HandCards.length === 0) {
        Cav.Winning();
    }
};

// 拿到抽到的牌
Cav.GameController.ReceivedCard = function (cavMsg) {

    Cav.GameController.HandCards.push(cavMsg.PokerCards[0]);

    // 抽到牌的動畫
    //$(".OppHandCard").eq(cavMsg.Index1).xxxxxxxxxxxxxxx();
};

// 收到對方交換牌的位置
Cav.GameController.ReceivedSwap = function (cavMsg) {
    //$(".OppHandCard").eq(cavMsg.Index1).xxxxxxxxxxxxxxx();
};

// 收到對方清掉的牌
Cav.GameController.ReceivedDump = function (cavMsg) {

    // 對方清掉牌的動畫
    //$(".OppHandCard").eq(cavMsg.Index1).xxxxxxxxxxxxxxx();

};

Cav.GameController.YouLose = function () {
    // call輸了的動畫
   
};