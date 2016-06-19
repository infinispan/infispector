var app = require('../../app.js');
var RSVP = require('rsvp');

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
                console.log('***Result: ', result[0]);

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
                var reg = /(?:\"dest\")\s*:\s*\".*?\"/g;
                var nodeField = test.match(reg);

                for (var i = 0; i < nodeField.length; i++) {
                    nodeField[i] = nodeField[i].replace('"dest":"', "").replace('\"', "");
                }
                console.log("\n Result of getNodes function (druidApi): " + nodeField);

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

    console.log('getMessagesCount function from druidApi.js called. '
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
                messagesCount = messagesCount[0].replace('"length":', "");

                console.log(messagesCount);

                response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
            })
            .done();
};

/*
 * Same as getMessagesCount for internal usage without a need of HTTP request
 */

var getMessagesCountIntern = function (srcNode, destNode) {
    
    return new Promise(function (resolve, reject) {

    var params = {host: "127.0.0.1:8084", debug: "true"};
    var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

    // when dimension is "message" we can get aggregation through different messages and their count
    druidRequester({
        query: {
            "queryType": "topN",
            "dataSource": "InfiSpectorTopic",
            "granularity": "all",
            "dimension": "src",
            "metric": "length",
            "threshold": "10000",
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

                if (messagesCount === null) {
                    // resolve with 0 messages count for now
                    // TODO -- look here at proper handling
                    var matrixElement = [srcNode, destNode, 0];
                    resolve(matrixElement);
                } else {
                    messagesCount = messagesCount[0].replace('"length":', "");

                    console.log("in getMessagesCountIntern extracted messagesCount from: " 
                            + test + " = " + messagesCount);

                    var matrixElement = [srcNode, destNode, messagesCount];
                    resolve(matrixElement);
                }
            })
            .done();
    }); // promise
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
                messagesCount = messagesCount[0].replace('"length":', "");

                console.log(messagesCount);

                response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
            })
            .done();
};

/*
 * Stejne jako getMessagesCountInInterval, akorat pro vnitrni pouziti bez nutnosti requestu
 */
var getMessagesCountInIntervalIntern = function (srcNode, destNode, fromTime, toTime) {

    return new Promise(function (resolve, reject) {

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
                    messagesCount = messagesCount[0].replace('"length":', "");
                    resolve(messagesCount);
                })
                .done();
    }); // promise
};


/**
* function that returns number of CacheTopologyControlCommand messages
*/
exports.getMessagesCountOfControlCache = function (request, response) {

 console.log('getMessagesCountOfControlCachefunction from druidApi.js was called. ');
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "count",
           "metric": "length",
           "threshold": 100000,
           "filter": {
           "type": "search",
           "dimension": "message",
              "query": {
                  "type": "insensitive_contains",
                  "value": "CacheTopologyControlCommand"
              }
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
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
               console.log("\n\nResult: " + JSON.stringify(messagesCount));
           })
           .done();
};

/**
* function that returns number of CacheTopologyControlCommand messages in given interval
*/
exports.getMessagesCountOfControlCacheInInterval = function (request, response) {

 console.log('getMessagesCountOfControlCacheInInterval function from druidApi.js was called. '
        + " " + request.body.fromTime + " " + request.body.toTime);
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   var fromTime = request.body.fromTime;
   var toTime = request.body.toTime;

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "count",
           "metric": "length",
           "threshold": 100000,
           "filter": {
           "type": "search",
           "dimension": "message",
              "query": {
                  "type": "insensitive_contains",
                  "value": "CacheTopologyControlCommand"
              }
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
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
               console.log("\n\nResult: " + JSON.stringify(messagesCount));
           })
           .done();
};


/**
* function that returns number of SingleRpcCommand messages
*/
exports.getMessagesCountOfSingleRpc = function (request, response) {

 console.log('getMessagesCountOfSingleRpcCommand function from druidApi.js was called. ');
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "count",
           "metric": "length",
           "threshold": 100000,
           "filter": {
           "type": "search",
           "dimension": "message",
              "query": {
                  "type": "insensitive_contains",
                  "value": "SingleRpcCommand"
              }
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
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
               console.log("\n\nResult: " + JSON.stringify(messagesCount));
           })
           .done();
};

/**
* function that returns number of SingleRpcCommand messages in given interval
*/
exports.getMessagesCountOfSingleRpcInInterval = function (request, response) {

 console.log('getMessagesCountOfSingleRpcCommandInInterval function from druidApi.js was called. ');
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);
   var fromTime = request.body.fromTime;
   var toTime = request.body.toTime;
   
   druidRequester({
       query: {
           "queryType": "topN",
           "dataSource": "InfiSpectorTopic",
           "granularity": "all",
           "dimension": "count",
           "metric": "length",
           "threshold": 100000,
           "filter": {
           "type": "search",
           "dimension": "message",
              "query": {
                  "type": "insensitive_contains",
                  "value": "SingleRpcCommand"
              }
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
               
               response.send({error: 0, jsonResponseAsString: JSON.stringify(messagesCount)}, 201);
               console.log("\n\nResult: " + JSON.stringify(messagesCount));
           })
           .done();
};


/*
* function that returns messages and timestamp from given node
*/
///////////// TO DO dodelat!!!!!!!
exports.getMessagesAndTimestampFromNode = function (request, response) {

    console.log('getMessagesAndTimestampFromNode function from druidApi.js was called. '
            + request.body.srcNode);

    var srcNode = "marek-9119";//request.body.srcNode;    

    var params = {host: "127.0.0.1:8084", debug: "true"};
    var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

    druidRequester({
        query: {
            "queryType": "topN",
            "dataSource": "InfiSpectorTopic",
            "granularity": "all",
            "dimension": "message",
            "metric": "length",
            "threshold": 100000,
            "filter": {
            "type": "search",
            "dimension": "message",
              "query": {
                  "type": "insensitive_contains",
                  "value": "CacheTopologyControlCommand"
              }
            },
            "aggregations": [
               {"type": "count", "fieldName": "length", "name": "length"}
            ],
            "intervals": ["2009-10-01T00:00/2020-01-01T00"]
        }
    })
            .then(function (result) {

                console.log(JSON.stringify(result));
                response.send({error: 0, jsonResponseAsString: JSON.stringify(result)}, 201);


            })
            .done();
};

/**
* function that returns bottom value of the slider
*/
exports.getBottomSliderValue = function (request, response) {

 console.log('getBottomSliderValue function from druidApi.js was called. ');
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "timeseries",
            "dataSource": "InfiSpectorTopic",
            "granularity": "all",
            "descending": "true",
            "aggregations": [
                {"type": "doubleMin", "fieldName": "timestamp", "name": "__time"}
            ],
            "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
           .then(function (result) {

               response.send({error: 0, jsonResponseAsString: JSON.stringify(result)}, 201);
               console.log("\n\nResult: Maximum" + JSON.stringify(result));
           })
           .done();
};


/**
* function that returns top value of the slider
*/
exports.getTopSliderValue = function (request, response) {

 console.log('getTopSliderValue function from druidApi.js was called. ');
      
   var params = {host: "127.0.0.1:8084", debug: "true"};
   var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

   druidRequester({
       query: {
           "queryType": "timeseries",
            "dataSource": "InfiSpectorTopic",
            "granularity": "all",
            "descending": "true",
            "aggregations": [
                {"type": "doubleMax", "fieldName": "timestamp", "name": "__time"}
            ],
            "intervals": ["2009-10-01T00:00/2020-01-01T00"]
       }
   })
           .then(function (result) {

               response.send({error: 0, jsonResponseAsString: JSON.stringify(result)}, 201);
               console.log("\n\nResult: Maximum" + JSON.stringify(result));
           })
           .done();
};



exports.getFlowChartMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    var numberOfNodes = nodes.length;
    var matrix = [];

    var promises = [];    

    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            // we concatenate N*N promises for 2D matrix into 1D array
            promises = promises.concat(getMessagesCountIntern(
                    JSON.parse(nodes[i].nodeName), JSON.parse(nodes[j].nodeName)));
            // console.log("Promises length = " + promises.length + " at i-j: " + i + "-" + j);
        }
    }
    
    // one matrix element is an [srcNode, destNode, messagesCount] array
    // each promise returns such an array
    // matrixElements is array of those arrays, ordered as executed and returned
    RSVP.all(promises).then(function (matrixElements) {
        console.log("\n in getFlowChartMatrix matrixElements after all promises resolved (stringified): " + JSON.stringify(matrixElements));
        
        for (var x = 0; x < i * j; x++) {
            matrix[x] = matrixElements[x];
        }
        
        console.log("\n in getFlowChartMatrix final matrix (stringified): " + JSON.stringify(matrix));
        response.send({error: 0, matrix: JSON.stringify(matrix)}, 201);

    }).catch(function (reason) {
        console.log("At least one of the promises FAILED: " + reason);
    });

};

exports.getChordDiagramMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    var numberOfNodes = nodes.length;
    var matrix = [];
    var promises = [];
    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            promises = promises.concat(getMessagesCountIntern(
                    JSON.parse(nodes[i].nodeName), JSON.parse(nodes[j].nodeName)));
        }
    }
    
    RSVP.all(promises).then(function (matrixElements) {
        for (var i = 0; i < numberOfNodes; i++) {
            matrix[i] = [];
            for (var j = 0; j < numberOfNodes; j++) {
                  matrix[i][j] = JSON.parse(matrixElements[i * numberOfNodes + j][2]);
            }
        }
        response.send({error: 0, matrix: JSON.stringify(matrix)}, 201);
    });
};

exports.getMessagesInfo = function (request, response) {
    var node = request.body.nodeName;
    // TODO druid request for message
    console.log(node);
};