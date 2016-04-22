/**
 * Routing configuration
 */
'use strict';

var api = {};

api.druid = require('../server/api/druidApi');
api.ispn = require('../server/api/ispnApi');

exports.queryDruid = function(req, res) {    
    api.druid.queryDruid(req, res);
};

exports.getEntry = function(req, res) {    
    api.ispn.getEntry(req, res);
};

exports.putEntry = function(req, res) {    
    api.ispn.putEntry(req, res);
};

exports.index = function(req, res){
  res.render('index');
};

exports.operations = function(req, res){
  res.render('operations');
};
