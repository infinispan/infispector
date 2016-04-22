var app = require('../../app.js');

exports.queryDruid = function (req, res) {    
    console.log("Called queryDruid function from druidApi.js.");
    res.send({error: 0, jsonObjects: "queryDruid function from druidApi.js called, check console log"}, 201);
};
