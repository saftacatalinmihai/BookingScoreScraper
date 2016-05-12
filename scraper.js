/**
 * Created by casafta on 10/5/2016.
 */
var fs = require('fs');
_und = require("underscore");

module.exports = function(url, cb) {

    var webdriverio = require('webdriverio');
    var options = {
        desiredCapabilities: {
            browserName: 'firefox'
        }
    };

    var client = webdriverio
        .remote(options);

    client.addCommand("getScores", function () {
        var client = this;
        return this.getHTML('.review_item_review_score', false, function (err, scores_html) {
            var scores = scores_html
                .map(s => {
                    return parseFloat(s.replace(',', '.'))
                })
                .filter(Boolean);
            console.log(scores);
            cb({ratings: scores});
            //add_ratings(ratings, scores);
            if (err) {
                console.log("Error: " + err);
            }
            return client
                .isExisting('#review_next_page_link')
                .then(function (isExisting) {
                    if (isExisting) {
                        return client
                            .click('#review_next_page_link')
                            .pause(2000)
                            .getScores()
                    }
                })
        })
    });

    client.addCommand('done', function () {
        console.log("DONE");
        cb({done: true});
    });

    client.addCommand('uncheckAllLanguages', function(){
        var client = this;
        return client.getHTML(".language_filter_checkbox", true, function(err, languages_html){
            var languages_html_u = _und.unique(languages_html);
            languages_html_u.map(function(lang){
                if (lang.indexOf("checked") > 0){
                    console.log(lang);
                    var match = lang.match(/value="(\w+)"/gi);
                    console.log(match[0]);
                    client
                        .click('[' + match[0] + ']')
                        .pause(2000)
                }
            })
        })
    });

    client.addCommand('clickFirstHotelLink', function(){
        var client = this;
        console.log("Go To first hotel link");
        return client
            .getAttribute(".hotel_name_link", 'href').then(function(url){
                return client
                    .url(url[0])
                    .pause(2000);
            });
    });

    client.addCommand('goToReviewsAndGetScores', function(){
        var client = this;
        return client
            .click('#show_reviews_tab')
            .pause(2000)
            .uncheckAllLanguages()
            .pause(4000)
            .getScores()
            .done()
            .end()
    });

    client
        .init()
        .url(url)
        .pause(2000)
        .isExisting('#show_reviews_tab')
        .then(function(isExisting){
            if (isExisting) {
                client
                    .goToReviewsAndGetScores()
            } else {
                console.log("Search Page");
                client
                    .clickFirstHotelLink()
                    .goToReviewsAndGetScores();
            }
        })

};