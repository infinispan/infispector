var app = require('../../app.js');

exports.queryDruid = function (req, res) {
    console.log('queryDruid function from druidApi.js was called.');
    res.send({ error: 0, jsonObjects: "{result: 'Here will be real data from the Druid instance.'}" }, 201);
};
