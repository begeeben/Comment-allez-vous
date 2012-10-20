

var game = {
    
    GameStarted: function (cavMsg) {

        Cav.Gamecontroller.HandCards = cavMsg.PokerCards;

    },

    // 收到對手抽牌
    CardPicked: function (cavMsg) {

        Cav.Gamecontroller.HandCards.splice(cavMsg.Index1, 1);

        if (Cav.Gamecontroller.HandCards.length === 0) {
            alert('我贏了');
        }

    },

    // 清自己成對的牌
    RemoveMatchCards: function (index1, index2) {

        // 判斷牌有沒有成對
        if (abs(Cav.Gamecontroller.HandCards[index1] - Cav.Gamecontroller.HandCards[index2]) === 13) {
            if (index1 > index2) {
                Cav.Gamecontroller.HandCards.splice(index1, 1);
                Cav.Gamecontroller.HandCards.splice(index2, 1);
            }
            else {
                Cav.Gamecontroller.HandCards.splice(index2, 1);
                Cav.Gamecontroller.HandCards.splice(index1, 1);
            }
        }
        else {
            alert('牌不成對');
        }

        if (Cav.Gamecontroller.HandCards.length === 0) {
            alert('我贏了');
        }

    },

    // 抽了對方牌之後收到對方牌的訊息
    GetOneCard: function (cavMsg) {
        
        Cav.Gamecontroller.HandCards.push(cavMsg.PokerCards[0]);

    },

    // 交換自己牌位置 (來源, 要放的位置)
    SwapCards: function (index1, index2) {

        var temp = Cav.Gamecontroller.HandCards.splice(index1, 1);
        Cav.Gamecontroller.HandCards.splice(index2, 0, temp);

    }

};