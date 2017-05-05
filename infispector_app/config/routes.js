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

exports.getNodes = function(req, res) {    
    api.druid.getNodes(req, res);
};

exports.getFlowChartMatrix = function(req, res) {    
    api.druid.getFlowChartMatrix(req, res);
};

exports.getFlowChartMatrixGroups = function(req, res) {    
    api.druid.getFlowChartMatrixGroups(req, res);
};

exports.getChordDiagramMatrix = function(req, res) {    
    api.druid.getChordDiagramMatrix(req, res);
};

exports.getMessagesInfo = function(req, res) {
    api.druid.getMessagesInfo(req, res);
};

exports.getEntry = function(req, res) {    
    api.ispn.getEntry(req, res);
};

exports.putEntry = function(req, res) {    
    api.ispn.putEntry(req, res);
};

exports.clearCache = function(req, res) {
   api.ispn.clearCache(req, res);
};

exports.initZoomableChart = function(req, res) {
   api.ispn.initZoomableChart(req, res);
};

exports.index = function(req, res){
  res.render('index');
};

exports.operations_get = function(req, res){
  res.render('operations_get');
};

exports.operations_put = function(req, res){
  res.render('operations_put');
};
