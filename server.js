var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var Ml = require('./machineLearning/Ml');
var app = express();


//requests
app.get('/scrape', function(req, res) {

    url = 'http://www.stjameshospital.com/site1/doctors/index.php/query';

    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html, { normalizeWhitespace: true });


            var jsonlist = [];
            // We'll use the unique header class as a starting point.
            $('.gl-view').filter(function() {

                // Let's store the data we filter into a variable so we can easily see what's going on.

                var data = $(this);

                // In examining the DOM we notice that the title rests within the first child element of the header tag. 
                // Utilizing jQuery we can easily navigate and get the text by writing the following code:
                //console.log(data);
                // name = data.filter('.col1').children().text();

                console.log(data.children().length);
                var count = data.children().length;
                var name, specialty, days, day, place;


                data.children().each(function(i, element) {

                    var name = $(this).children().first().text();
                    var spec = $(this).next().next().children().next().children().first().text();


                    var list = {};
                    $(this).children().each(function(j, ele) {
                        if ($(this).attr('class') === 'gl-view-row-container day') {
                            var spld = $(this).children().children().attr('title');

                            if (spld) {
                                var area = spld.split(' - ');
                                var days_ = {
                                    place: area[0],
                                    day: area[1]
                                };
                                list[j] = days_;
                            }

                        }
                    });
                    var json = {
                        'name': name,
                        'specialty': spec,
                        days: list
                    };
                    //json.days = list;
                    //console.log(json);
                    jsonlist.push(json);

                });

                console.log(jsonlist);
                /* var each = data.children().first();
                 console.log(each.length);
                 var leth = each.length;

                 for (var i = 0; i < leth; i++) {
                     console.log(each.get(i));
                 }
                 var name = each.children().first().text();
                 var specialty = each.children().next().children().text();
                 // Once we have our title, we'll store it to the our json object.

                 json.name = name;
                 json.specialty = specialty;*/

            });
            // write(jsonlist);
            res.send(jsonlist);
        } else {
            console.log(error);
        }

    });
});
app.get('/make', function(req, res) {
    read();
    res.send('done');

});
app.get('/prepare', function(req, res) {

    Ml.preparedata(function(data) {
        res.send(data);
    });

});
app.get('/train', function(req, res) {
    Ml.train(function(data) {
        res.send(data);
    });
});

function read() {
    fs.readFile('dataset.txt', function(err, data) {
        if (err) {
            return console.error(err);
        }
        console.log("Asynchronous read: " + data.toString());
    });
}

function remove_duplicates_safe_place(arr) {
    var seen = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        if (!(arr[i].specialty in seen)) {
            ret_arr.push(arr[i].specialty);
            seen[arr[i].specialty] = true;
        }
    }
    return ret_arr;
}

function write(text) {
    if (typeof text) {

        var list = remove_duplicates_safe_place(text);
        var file = fs.createWriteStream('./datasets/dataset.txt');
        file.on('error', function(err) { /* error handling */ });
        list.forEach(function(v, index) {
            let s = _.random(1, 20);
            file.write(index + ',' + v + ',' + s + '\n');
        });
        file.end();
    } else {
        fs.writeFile('dataset.txt', text, function(err) {
            if (err) {
                return console.error(err);
            }
            return console.log('wrote');
        });
    }
}

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;