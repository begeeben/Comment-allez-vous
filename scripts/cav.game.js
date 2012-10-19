//var Cav = {};
Cav.BoardAreaId = "board-area";
Cav.PokerTemplateId = "HandCardTemplate";
Cav.PokerSource = [];
Cav.DealSpeed = 100;
Cav.HandCardBasicPosition = { X: 0, Y: 325 };
Cav.P2HandCardBasicPosition = { X: 0, Y: 0 };
Cav.GameController = {
    HandCard: [],
    Switch: function (cavMsg) {
        this[cavMsg.FunctionName](cavMsg);
    },
    GameStarted: function (cavMsg) {
        //初始 Source
        Cav.PokerSource.push({ Id: 0, No: 0, Suit: 0 });
        for (var id = 1; id <= 26; id++) {
            var no = id % 13;
            var suit = parseInt(id / 13);
            if(no == 0){
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
                //如果對手牌數不為14則第一回發牌不做事
            } else {
                var emptyPokerHtml = Mustache.to_html(pokerTemplate, new Object()).replace(/^\s*/mg, '');
                var emptyPoker = $(emptyPokerHtml).appendTo("#" + Cav.BoardAreaId).css("z-index", i).animate({ left: p2PositionX, top: Cav.P2HandCardBasicPosition.Y }, delayTime);
                delayTime += Cav.DealSpeed;
                p2PositionX += 60;
            }

            var id = cavMsg.PokerCards[i];
            var card = Cav.PokerSource[id];
            card.ImgUrl = cavMsg.PicMapping[card.No];
            var pokerHtml = Mustache.to_html(pokerTemplate, card).replace(/^\s*/mg, '');
            var poker = $(pokerHtml).appendTo("#" + Cav.BoardAreaId).css("z-index", i).animate({ left: positionX, top: Cav.HandCardBasicPosition.Y }, delayTime);
            delayTime += Cav.DealSpeed;
            positionX += 60;
        }
    }
};