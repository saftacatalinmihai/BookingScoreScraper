/**
 * Created by casafta on 10/5/2016.
 */
var fs = require('fs');

var ratings = [];
function add_ratings(ratings, new_list){
    for (var i in new_list){
        ratings.push(new_list[i]);
    }
}

var sum = function(){ return ratings.reduce(function(a, b) { return a + b; });};
var avg = function(){ return sum() / ratings.length;};
function bean(list, low, high){
    return list.filter(i => {return i > low && i <= high}).length;
}
function beans(list, from, to, step){
    var beans = [];
    for ( var i = from; i < to; i = i + step){
        beans.push(bean(list, i, i+step));
    }
    return beans;
}

//var url = "http://www.booking.com/hotel/de/riverside-royal.ro.html";

//var url = "http://www.booking.com/hotel/de/louisa-s-place.ro.html?label=gen173nr-1FCAEoggJCAlhYSDNiBW5vcmVmaMABiAEBmAEguAEIyAEM2AEB6AEB-AELqAID;sid=e3dbbc139a10777f385339f272882ba8;dcid=4;checkin=2016-05-10;checkout=2016-05-11;ucfs=1;highlighted_blocks=6693107_88925314_0_2;room1=A,A;dest_type=city;dest_id=-1746443;srfid=ccd47c2b9bee02652bca65d7ce1442e9f8d598c6X7;highlight_room=";
//var url = "http://www.booking.com/hotel/de/louisa-s-place.ro.html?label=gen173nr-1FCAEoggJCAlhYSDNiBW5vcmVmaMABiAEBmAEguAEIyAEM2AEB6AEB-AELqAID;sid=e3dbbc139a10777f385339f272882ba8;dcid=4;checkin=2016-05-10;checkout=2016-05-11;dest_id=-1746443;dest_type=city;dist=0;group_adults=2;group_children=0;highlighted_blocks=6693107_88925314_0_2;no_rooms=1;room1=A%2CA;sb_price_type=total;srfid=ccd47c2b9bee02652bca65d7ce1442e9f8d598c6X7;type=total;ucfs=1&#tab-reviews";
//var url = "http://www.booking.com/hotel/de/louisa-s-place.ro.html?label=gen173nr-1FCAEoggJCAlhYSDNiBW5vcmVmaMABiAEBmAEguAEIyAEM2AEB6AEB-AELqAID;sid=09e5f9673ef0b1a416bfcbdf58a36e59;dcid=4;checkin=2016-05-10;checkout=2016-05-11;dest_id=-1746443;dest_type=city;dist=0;group_adults=2;group_children=0;highlighted_blocks=6693107_88925314_0_2;hpos=1;no_rooms=1;room1=A%2CA;sb_price_type=total;srfid=1bf2064b170d1990fef071e9a9a551ebb1b4cf64X1;highlight_room=";
//var url = "http://www.booking.com/hotel/de/louisa-s-place.html";

//var url = "http://www.booking.com/hotel/de/apartments-mitte-residence.ro.html";

var url = "http://www.booking.com/hotel/de/sleepcheaphostel.ro.html";
var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

var client = webdriverio
    .remote(options);

client.addCommand("getScores", function(){
    var client = this;
    return this.getHTML('.review_item_review_score', false, function(err, scores_html){
        var scores = scores_html
            .map(s => {return parseFloat(s.replace(',','.'))})
            .filter(Boolean);
        console.log(scores);
        add_ratings(ratings, scores);
        if (err) {
            console.log("Error: " + err);
        }
        return client
            .isExisting('#review_next_page_link')
            .then(function(isExisting) { if (isExisting) {
                return client
                    .click('#review_next_page_link')
                    .pause(2000)
                    .getScores()
            }})
    })
});

command = function(selector) {
    var client = this;
    console.log(selector);
    return client.isSelected(selector).then(function(isSelected) {
        if(isSelected) {
            console.log("selector: " + selector + " is selected");
            client.click(selector);
        }
    });
};

client.addCommand('unTickBox', command);
client.addCommand('store', function(){
    console.log("DONE");
    fs.writeFile('ratings', ratings, function(err){
        if(err){
            return console.log(err);
        } else {
            console.log("Avg: " + avg());
            console.log("Chart:");
            console.log(beans(ratings, 0, 10, 0.5));
        }
    });

});

client
    .init()
    .url(url)
    .pause(2000)
    .click('#show_reviews_tab')
    .pause(2000)
    .unTickBox('[value="en"]')
    //.pause(2000)
    //.unTickBox('[value="ro"]')
    .pause(2000)
    .getScores()
    .store();