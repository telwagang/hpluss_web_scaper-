var _ = require('lodash');
var ML = require('ml');
var fs = require('fs');
var csv = require("fast-csv");
var readline = require('readline');
var convnetjs = require('convnetjs');
var date_ex = require("date-extended");
var Matrix = require('ml-matrix');
var trainning_data = [];
/**
 * Ml
 * 
 * @description :: JSON Webtoken Service for sails
 * 
 *
 */



module.exports = {

    preparedata: function(callback) {

        readDurationClass();
        return callback({ data: "running" });
    },
    train: function(callback) {

        readTrainingset();
        return callback('running....');
    }

};

function LogisticRegression(train_fold, train_output, test_fold) {
    //const SLR = require('ml-regression').SLR;
    let inputs = Matrix.columnVector(train_fold);
    let outputs = [20, 40, 30, 50, 60];

    //var target = new ML.Regression.MLR(5,false);

    var regression = new ML.Regression.SLR(train_fold, train_output);
    //var regression = new ML.Regression.MLR(5,false);
    target.
    regression.train();

    var regtion = regression.predict(test_fold);
    regression.computeX(regtion);
    console.log("Prediction....." + regtion);
    regression.toString(3) === 'f(x) = - 0.265 * x + 50.6';
    // ANNRegression(train_fold, train_output, test_fold);
}

function ANNRegression(train_fold, train_output, test_fold) {
    var layer_defs = [];
    layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: 2 });
    layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
    layer_defs.push({ type: 'regression', num_neurons: 1 });
    var net = new convnetjs.Net();
    net.makeLayers(layer_defs);

    var x = new convnetjs.Vol(train_fold);

    // train on this datapoint, saying [0.5, -1.3] should map to value 0.7:
    // note that in this case we are passing it a list, because in general
    // we may want to  regress multiple outputs and in this special case we 
    // used num_neurons:1 for the regression to only regress one.
    var trainer = new convnetjs.Trainer(net, { learning_rate: 0.01, momentum: 0.0, batch_size: 1, l2_decay: 0.001 });
    trainer.train(x, train_output);

    // evaluate on a datapoint. We will get a 1x1x1 Vol back, so we get the
    // actual output by looking into its 'w' field:
    var y = new convnetjs.Vol(test_fold);
    var predicted_values = net.forward(y);
    console.log('predicted value: ' + predicted_values.w[0]);
}

function nfold(data, output) {
    var total = data.length - 1;
    var train_fold = [];
    var train_output = [];
    var test_fold = [];

    var test_size = ((total * 20) / 100);
    var train_size = total - test_size;

    for (var i = 0; i < train_size; i++) {
        train_fold.push(data[i]);
        train_output.push(output[i]);
    }
    for (var j = parseInt(train_size); j < total; j++) {
        test_fold.push(data[j]);
    }
    //ANNRegression(train_fold, train_output, test_fold);
    LogisticRegression(train_fold[1], train_output.slice(0, 10), test_fold[1]);
}

function readTrainingset() {
    var stream2 = fs.createReadStream("./datasets/training.csv");
    var datalist = [];
    var output = [];
    var csr = csv.fromStream(stream2)
        .on("data", function(data) {
            // console.log(data[1] + ' ' + data[2]);
            datalist.push([parseInt(data[0]), parseInt(data[1]), parseInt(data[2]), parseInt(data[3]), parseInt(data[4])]);
            output.push([parseInt(data[6])]);
        })
        .on("end", function() {
            console.log("Dataset ready: Done");
            //console.log(datalist);
            //runTrain(datalist, output);
            //LogisticRegression(datalist, output);
            nfold(datalist, output);
        });
}

function readDurationClass() {
    var listdata = [];

    var stream = fs.createReadStream("./datasets/dataset.csv");

    csv
        .fromStream(stream, { headers: [, , "digit", , "age", , ] })
        .on("data", function(data) {

            listdata.push(data);
        })
        .on("end", function() {
            console.log("Class Duration");
            // console.log(listdata);
            readSpecialtyFeature(listdata);
        });

}

function readSpecialtyFeature(data) {

    var stream2 = fs.createReadStream("./datasets/dataset.txt");
    var datalist = [];
    var csr = csv.fromStream(stream2)
        .on("data", function(data) {
            // console.log(data[1] + ' ' + data[2]);
            datalist.push({ specitly: data[1], level: data[2] });
        })
        .on("end", function() {
            console.log("Specialty Feature: Done");
            //console.log(datalist);
            readTimeFeature(data, datalist);
        });


}

function readTimeFeature(durationclass, specialty) {
    var stream2 = fs.createReadStream("./datasets/time-feature.txt");
    var datalist = [];
    csv.fromStream(stream2)
        .on("data", function(data) {
            //console.log(data[1] + ' ' + data[2]);
            datalist.push({ time: data[1], level: data[2] });
        })
        .on("end", function() {
            console.log("Time feature: Done");
            dayFeature(durationclass, specialty, datalist);
        });
}

function dayFeature(durationclass, specialty, time) {
    var stream2 = fs.createReadStream("./datasets/day-feature.txt");
    var datalist = [];
    csv.fromStream(stream2)
        .on("data", function(data) {
            //console.log(data[1] + ' ' + data[2]);
            datalist.push({ day: data[1], level: data[2] });
        })
        .on("end", function() {
            console.log("Day Feature: Done");
            LocationFeature(durationclass, specialty, time, datalist);
        });
}

function LocationFeature(durationclass, specialty, time, day) {
    var stream2 = fs.createReadStream("./datasets/location-feature.txt");
    var datalist = [];
    csv.fromStream(stream2)
        .on("data", function(data) {
            //console.log(data[1] + ' ' + data[2]);
            datalist.push({ location: data[1], level: data[2] });
        })
        .on("end", function() {
            console.log("Location Feature: Done");
            DateFeature(durationclass, specialty, time, day, datalist);
        });
}

function DateFeature(durationclass, specialty, time, day, location) {
    var stream2 = fs.createReadStream("./datasets/date-feature.csv");
    var datalist = [];
    csv.fromStream(stream2)
        .on("data", function(data) {
            //console.log(data[1] + ' ' + data[2]);
            datalist.push({ date: data[0] });
        })
        .on("end", function() {
            console.log("Location Feature: Done");
            buildModel(durationclass, specialty, time, day, location, datalist);
        });
}

function buildModel(durationclass, specialty, time, day, location, date) {
    console.log(".....................");
    console.log(durationclass);
    console.log(specialty);
    console.log(time);
    console.log(day);
    console.log(location);
    console.log(date);
    var model = [];


    _.forEach(specialty, function(s, j) {
        var randtime = _.random(0, 3);
        var randday = _.random(0, 6);
        var randlocation = _.random(0, 3);
        var randduration = _.random(0, durationclass.length - 1);
        var randage = _.random(0, durationclass.length - 1);
        var randdate = _.random(0, date.length - 1);

        var t = time[randtime].level;
        var d = day[randday].level;
        var l = location[randlocation].level;
        var dur = durationclass[randduration].digit;
        var a = durationclass[randage].age;
        var dat = date[randdate].date;
        var dat_ = date_ex.format(new Date(dat), "MMddyyyy");

        model.push({ specialty: s.level, day: d, time: t, age: a, location: l, date: dat_, duration: dur });

    });
    for (var i = 0; i < 1000; i++) {
        var randspeci = _.random(0, specialty.length - 1);
        var randtime = _.random(0, 3);
        var randday = _.random(0, 6);
        var randlocation = _.random(0, 3);
        var randduration = _.random(0, durationclass.length - 1);
        var randage = _.random(0, durationclass.length - 1);
        var randdate = _.random(0, date.length - 1);

        var t = time[randtime].level;
        var d = day[randday].level;
        var l = location[randlocation].level;
        var dur = durationclass[randduration].digit;
        var a = durationclass[randage].age;
        var s = specialty[randspeci].level;
        var dat = date[randdate].date;
        var dat_ = date_ex.format(new Date(dat), "MMddyyyy");

        model.push({ specialty: s, day: d, time: t, age: a, location: l, date: dat_, duration: dur });
    }

    writeModel(model);
}

function writeModel(list) {

    var file = fs.createWriteStream('./datasets/training.csv');
    file.on('error', function(err) { /* error handling */ });
    console.log("writting.......")
    list.forEach(function(v, index) {
        var line = '';
        _.forEach(v, function(i, index) {
            line += (i + ',');
        });
        file.write(line + '\n');
    });
    file.end();
    console.log("Done.....");
}

function selfTrain(item) {
    var list = new Array();
    list.push(item);

    writeModel(list);

    readTrainingset();

}