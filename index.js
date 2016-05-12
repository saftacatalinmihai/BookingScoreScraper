var bookingcom_score_scrape = require('./scraper');
var stats = require('./stats');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('scrape-page', function (data) {
        console.log(data['url']);
        getRatings(data['url'], socket);
    });
});

// 8 com:  http://www.booking.com/hotel/de/apartments-mitte-residence.ro.html
// 200 com: http://www.booking.com/hotel/de/sleepcheaphostel.ro.html
function getRatings (url, socket) {
    console.log("ASd");
    var ratings_all = [];   
    bookingcom_score_scrape(url, function (json) {
        if ('err' in json){
            socket.emit('err', json['err']);
            return ;
        }
        if ('done' in json){
            socket.emit('done', true);
        }
        console.log("Got ratings");
        var ratings = json['ratings'];
        console.log(ratings);
        stats.add_ratings(ratings_all, ratings);
        console.log(stats.avg(ratings_all));
        console.log(stats.beans(ratings_all, 0, 10, 0.5));
        socket.emit("ratings", {
            ratings_all: ratings_all,
            ratings: ratings,
            avg: stats.avg(ratings_all),
            beans: stats.beans(ratings_all, 0, 10, 0.5)
        });

        //fs.writeFile('ratings', ratings, function (err) {
        //    if (err) {
        //        return console.log(err);
        //    } else {
        //        console.log("Avg: " + avg());
        //        console.log("Chart:");
        //        console.log(beans(ratings, 0, 10, 0.5));
        //    }
        //});
    });
}
