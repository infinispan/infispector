/**
 * Routing configuration
 */
'use strict';

var api = {};

api.druid = require('../server/api/druidApi');

exports.queryDruid = function(req, res) {
    console.log('In routes.js, in queryDruid function.');
    api.druid.queryDruid(req, res);
};

exports.index = function(req, res){
  res.render('index');
};

exports.root = function (req, res) {
    if (!req.user) {
        res.render('index');
    }
    else {
        res.render('index');
    }
};


