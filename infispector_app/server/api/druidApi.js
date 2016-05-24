var app = require('../../app.js');

//specimen 
exports.queryDruid = function (request, response) {

 console.log('queryDruid function from druidApi.js was called. '
           + request.body.payload + " " + request.body.myQuery);

   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "dest",
           "metric": "length",
           "threshold": 5,
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
           .then(function (result) {
               console.log('***Result: ', result);
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(result[0])}, 201);
               //response.json("{result: " + result[0].result[1] + " }");
           })
           .done();
};


// function that returns field of nodes 
//// add null to nodes in .getNodes method
exports.getNodes = function (request, response) {

   console.log('getNodes function from druidApi.js was called.');

   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "dest",
           "metric": "length",
           "threshold": 100000,
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
           .then(function (result) {
       
               var test = JSON.stringify(result[0]);
               var reg = /(?:\"dest\"):\"[a-zA-Z]+-\d+/g; 
               var nodeField = test.match(reg);

               for (var i = 0; i < nodeField.length; i++){
                   nodeField[i] = nodeField[i].replace('"dest":"',"");

               }
               console.log("\n\nResult: "+ nodeField);
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(nodeField)}, 201);
           })
           .done();
};


/*
@brief function which returns final count of messages from src node to dest node
@param srcNode
@param destNode
@return JSON 
*/

exports.getMessagesCount = function (request, response) {

  console.log('getMessagesCount function from druidApi.js was called. '
           + request.body.srcNode + " " + request.body.destNode);
    
   var srcNode = request.body.srcNode;
   var destNode = request.body.destNode;
     
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "length",
           "metric": "length",
           "threshold": 10000,
           "filter": {
		   "type": "and",
		   "fields": [
		      {
		        "type": "selector",
		        "dimension": "src",
		        "value": srcNode
		      },
		      {
		        "type": "selector",
		        "dimension": "dest",
		        "value": destNode
		      }
		    ]
		  },
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
            
           .then(function (result) {
                
               var test = JSON.stringify(result[0]); 
               var reg = /(?:"length":)[0-9]+/g; 
               var messagesCount = test.match(reg);      
               messagesCount = messagesCount[0].replace('"length":',"");
               
               console.log(messagesCount);
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
           })
           .done();
};

/*
 * Stejne jako getMessagesCount, akorat pro vnitrni pouziti bez nutnosti requestu
 */

var getMessagesCountIntern = function (srcNode, destNode) {
     
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "length",
           "metric": "length",
           "threshold": 10000,
           "filter": {
		   "type": "and",
		   "fields": [
		      {
		        "type": "selector",
		        "dimension": "src",
		        "value": srcNode
		      },
		      {
		        "type": "selector",
		        "dimension": "dest",
		        "value": destNode
		      }
		    ]
		  },
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
            
           .then(function (result) {
                
               var test = JSON.stringify(result[0]); 
               var reg = /(?:"length":)[0-9]+/g; 
               var messagesCount = test.match(reg);      
               messagesCount = messagesCount[0].replace('"length":',"");
               
               console.log(messagesCount);
               return messagesCount;
           })
           .done();
};

/*
@brief function which returns final count of messages from src node to dest node and from given time interval
@param srcNode
@param destNode
@param fromTime
@param toTime
@return string
*/

exports.getMessagesCountInInterval = function (request, response) {

 console.log('getMessagesCountInInterval function from druidApi.js was called. '
           + request.body.srcNode + " " + request.body.destNode
           + " " + request.body.fromTime + " " + request.body.toTime);
    
   var srcNode = request.body.srcNode;
   var destNode = request.body.destNode;
   var fromTime = request.body.fromTime;
   var toTime = request.body.toTime;
    
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "length",
           "metric": "length",
           "threshold": 10000,
           "filter": {
		   "type": "and",
		   "fields": [
		      {
		        "type": "selector",
		        "dimension": "src",
		        "value": srcNode
		      },
		      {
		        "type": "selector",
		        "dimension": "dest",
		        "value": destNode
		      }
		    ]
		  },
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": [fromTime + "/" + toTime]
       }
   })
           .then(function (result) {
                
               var test = JSON.stringify(result[0]); 
               var reg = /(?:"length":)[0-9]+/g; 
               var messagesCount = test.match(reg);      
               messagesCount = messagesCount[0].replace('"length":',"");
               
               console.log(messagesCount);
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
           })
           .done();
};

/*
 * Stejne jako getMessagesCountInInterval, akorat pro vnitrni pouziti bez nutnosti requestu
 */

var getMessagesCountInIntervalIntern = function (srcNode, destNode, fromTime, toTime) {   
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "length",
           "metric": "length",
           "threshold": 10000,
           "filter": {
		   "type": "and",
		   "fields": [
		      {
		        "type": "selector",
		        "dimension": "src",
		        "value": srcNode
		      },
		      {
		        "type": "selector",
		        "dimension": "dest",
		        "value": destNode
		      }
		    ]
		  },
           "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
           ],
           "intervals": [fromTime + "/" + toTime]
       }
   })
           .then(function (result) {
                
               var test = JSON.stringify(result[0]); 
               var reg = /(?:"length":)[0-9]+/g; 
               var messagesCount = test.match(reg);      
               messagesCount = messagesCount[0].replace('"length":',"");
               return messagesCount;
           })
           .done();
};

exports.flowChartMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    var numberOfNodes = nodes.length;
    var matrix = [];
    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            matrix[i * numberOfNodes + j] = [nodes[i], nodes[j], getMessagesCountIntern(nodes[i], nodes[j])];
        }
    }
    response.send({error: 0, matrix: JSON.stringify(matrix)}, 201);
};

exports.chordDiagramMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    var numberOfNodes = nodes.length;
    var matrix = [];
    for (var i = 0; i < numberOfNodes; i++) {
        matrix[i] = [];
        for (var j = 0; j < numberOfNodes; j++) {
            matrix[i][j] = getMessagesCountIntern(nodes[i], nodes[j]);
        }
    }
    response.send({error: 0, matrix: JSON.stringify(matrix)}, 201);
};