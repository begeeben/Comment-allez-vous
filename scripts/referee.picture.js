Referee.Picture = {

    getPicUrls: function (callback) {

        var picUrls = [];
        var statement = "select src from html where url='http://anal03.pixnet.net/blog' and xpath='//*[@class=\"article-content\"]/p/a/img'";
        $.queryYQL(statement, callback);

    }

};

//$(document).ready(function () {

//    //var test = Picture.getPicUrls();

//    var t = $("#content").empty();
//        //    statement = "select * from html where url='http://anal03.pixnet.net/blog' and xpath='//*[@id=\"article-box\"]/p/a/img/@src'";
//        statement = "select src from html where url='http://anal03.pixnet.net/blog' and xpath='//*[@class=\"article-content\"]/p/a/img'";
//        $.queryYQL(statement, function (data) {
//            $("#content").html(data.results);
//            var log;
//            /*array*/
//            //var logarray=new array(13);
//            //log = $("img").attr("src");
//            $("img").each(function (i) {
//                log += $("img").attr("src") + ",";
//            });
//            /*split string*/
//            //logarray=log.split(",");
//            //log = $("img").size();

//            $("#log").html(log);
//        });

//});