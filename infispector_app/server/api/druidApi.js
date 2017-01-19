var app = require('../../app.js');
var RSVP = require('rsvp');

var params = {host: "127.0.0.1:8084", debug: "true"};
var druidRequester = require('facetjs-druid-requester').druidRequesterFactory(params);

// TODO: pass this as a parameter when starting grunt to enable/disable log messages
// without the need of code change here
var druid_debug_enabled = true;
var debug = function (msg) {
    if (druid_debug_enabled) {
        console.log(msg);
    }
}

/*
 * Function asks druid instance for the list of communication nodes
 * and internally parses the result in order to return clear list of nodes.
 * 
 * @param {type} request
 * @param {type} response
 * @returns list of communication nodes
 */
exports.getNodes = function (request, response) {

    debug('Called getNodes function in druidApi.js.');

    var druidQueryJson = createGeneralTopNDruidQueryBase("dest", "length");
    // --> no filter here, not needed <--
    setAggregationsToDruidQueryBase(druidQueryJson, "count", "length", "length");
    setIntervalsToDruidQueryBase(druidQueryJson); // no from/toTime, use default

    druidRequester(druidQueryJson)
            .then(function (result) {
                var res = JSON.stringify(result[0]);
                var reg = /(?:\"dest\")\s*:\s*\".*?\"/g;
                var nodeField = res.match(reg);

                for (var i = 0; i < nodeField.length; i++) {
                    nodeField[i] = nodeField[i].replace('"dest":"', "").replace('\"', "");
                }
                debug("Result of getNodes function (druidApi): " + nodeField);
                response.send({error: 0, jsonResponseAsString: JSON.stringify(nodeField)}, 201);
            })
            .done();
};

/**
 * Function that returns final count of messages from src node
 * to dest node in a given time interval with respective filter
 * 
 * Possible Infinispan related filters (for more charts on dashboard) -- 
 * [SingleRpcCommand, CacheTopologyControlCommand, StateResponseCommand, StateRequestCommand]
 * 
 * @param srcNode
 * @param destNode
 * @param searchMessageText
 * @param fromTime (format: 2000-10-01T00:00)
 * @param toTime (format: 2000-10-01T00:00)
 */
var getMessagesCountIntern = function (srcNode, destNode, searchMessageText, fromTime, toTime) {

    return new Promise(function (resolve, reject) {
        debug('getMessagesCountIntern function from druidApi.js was called.');

        // dimension is "src" now
        // when dimension would be "message" we can get aggregation through
        // different messages and their count
        var druidQueryJson = createGeneralTopNDruidQueryBase("src", "length");
        setFilterToDruidQueryBase(druidQueryJson, "and", srcNode, destNode, searchMessageText);
        setAggregationsToDruidQueryBase(druidQueryJson, "count", "length", "length");
        setIntervalsToDruidQueryBase(druidQueryJson, fromTime, toTime); // no from/toTime, use default

        druidRequester(druidQueryJson).then(function (result) {
            var res = JSON.stringify(result[0]);
            var reg = /(?:"length":)[0-9]+/g;
            var messagesCount = res.match(reg);

            if (messagesCount === null) {
                // resolve with 0 messages count for now
                // TODO -- look here at proper handling                        
                resolve([srcNode, destNode, 0]);
            } else {
                messagesCount = messagesCount[0].replace('"length":', "");

                debug("in getMessagesCountIntern extracted messagesCount from: "
                        + res + " = " + messagesCount);
                resolve([srcNode, destNode, messagesCount]);
            }
        }).done();
    }); // promise
};

/*
 * Function that returns messages and timestamp from given src node
 */
exports.getMessagesInfo = function (request, response) {

    debug('getMessagesInfo function from druidApi.js was called. '
            + request.body.nodeName);

    var srcNode = request.body.nodeName;
    var destNode = null;
    var searchMessageText = request.body.searchMessageText;

    var druidQueryJson = createGeneralTopNDruidQueryBase("message", "length");
    setFilterToDruidQueryBase(druidQueryJson, "and", srcNode, destNode, searchMessageText);
    setAggregationsToDruidQueryBase(druidQueryJson, "count", "length", "length");
    setIntervalsToDruidQueryBase(druidQueryJson); // no from/toTime, use default

    druidRequester(druidQueryJson)
            .then(function (result) {
                debug(JSON.stringify(result));
                response.send({error: 0, jsonResponseAsString: JSON.stringify(result)}, 201);
            })
            .done();
};

/**
 * Returns the time of the first message in monitored communication
 * 
 * TODO: adjust our query "builder" in druidApi.js if needed
 */
exports.getMinimumMessageTime = function (request, response) {

    debug('getMinimumMessageTime function in druidApi.js was called. ');

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
 * Returns the time of the last message in monitored communication
 * 
 * TODO: adjust our query "builder" in druidApi.js if needed
 */
exports.getMaximumMessageTime = function (request, response) {

    debug('getMaximumMessageTime function in druidApi.js was called. ');

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

// TODO -- move to chartingApi.js and require druidApi.js  
exports.getFlowChartMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    // we will create one chart for every significant message type / pattern 
    var searchMessageText = request.body.searchMessageText;
    var numberOfNodes = nodes.length;
    var matrix = [];

    var promises = [];

    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            // we concatenate N*N promises for 2D matrix into 1D array
            promises = promises.concat(getMessagesCountIntern(
                    JSON.parse(nodes[i].nodeName), JSON.parse(nodes[j].nodeName),
                    searchMessageText, from, to));
            // console.log("Promises length = " + promises.length + " at i-j: " + i + "-" + j);
        }
    }

    // one matrix element is an [srcNode, destNode, messagesCount] array
    // each promise returns such an array
    // matrixElements is array of those arrays, ordered as executed and returned
    RSVP.all(promises).then(function (matrixElements) {
        debug("\n in getFlowChartMatrix matrixElements after all promises resolved (stringified): " +
                JSON.stringify(matrixElements));

        for (var x = 0; x < i * j; x++) {
            matrix[x] = matrixElements[x];
        }

        debug("\n in getFlowChartMatrix final matrix (stringified): " + JSON.stringify(matrix));
        response.send({error: 0, matrix: JSON.stringify(matrix), searchMessage: JSON.stringify(searchMessageText)}, 201);

    }).catch(function (reason) {
        console.log("At least one of the promises FAILED: " + reason);
    });

};

// TODO -- move to chartingApi.js and require druidApi.js
exports.getChordDiagramMatrix = function (request, response) {
    var nodes = request.body.nodes;
    var from = request.body.from;
    var to = request.body.to;
    // we will create one chart for every significant message type / pattern 
    var searchMessageText = request.body.searchMessageText;
    var numberOfNodes = nodes.length;
    var matrix = [];
    var promises = [];
    for (var i = 0; i < numberOfNodes; i++) {
        for (var j = 0; j < numberOfNodes; j++) {
            promises = promises.concat(getMessagesCountIntern(
                    JSON.parse(nodes[i].nodeName), JSON.parse(nodes[j].nodeName),
                    searchMessageText, from, to));
        }
    }

    RSVP.all(promises).then(function (matrixElements) {
        for (var i = 0; i < numberOfNodes; i++) {
            matrix[i] = [];
            for (var j = 0; j < numberOfNodes; j++) {
                matrix[i][j] = JSON.parse(matrixElements[i * numberOfNodes + j][2]);
            }
        }
        response.send({error: 0, matrix: JSON.stringify(matrix), searchMessage: JSON.stringify(searchMessageText)} ,201);
    });
};


// EXAMPLE QUERY
// { query: {
//            "queryType": "topN",
//            "dataSource": "InfiSpectorTopic",
//            "granularity": "all",
//            "dimension": "count",
//            "metric": "length",
//            "threshold": 100000,
//            "filter": {
//                    "type": "and",
//                    "fields": [
//                        {
//                            "type": "selector",
//                            "dimension": "src",
//                            "value": srcNode
//                        },
//                        {
//                            "type": "selector",
//                            "dimension": "dest",
//                            "value": destNode
//                        },
//                        {
//                            "type": "search",
//                            "dimension": "message",
//                            "query": {
//                                "type": "insensitive_contains",
//                                "value": "SingleRpcCommand"
//                        }
//                    ]
//                }
//            },
//            "aggregations": [{"type": "count", "fieldName": "length", "name": "length"}],
//            "intervals": [fromTime + "/" + toTime]
// }}

// QUERY JSON BUILDER SECTION

/**
 * @param dimension - mandatory - dimension to query (Druid: A String or 
 * JSON object defining the dimension that you want the top taken for.)
 * 
 * @param metric - mandatory - metric to query (Druid: A String or JSON object
 * specifying the metric to sort by for the top list.)
 */
var createGeneralTopNDruidQueryBase = function (dimension, metric) {
    var queryJson = {};
    queryJson.query = {};
    queryJson.query.queryType = "topN";
    queryJson.query.dataSource = "InfiSpectorTopic";
    queryJson.query.granularity = "all";
    queryJson.query.dimension = dimension;
    queryJson.query.metric = metric;
    queryJson.query.threshold = "100000"; // TODO: check -- is this enough?
    return queryJson;
}

/**
 * @param dimensions - A JSON list of dimensions to select; 
 * or see http://druid.io/docs/latest/querying/dimensionspecs.html for ways to 
 * extract dimensions. If left empty, all dimensions are returned.
 * 
 * @param metrics - A String array of metrics to select. If left empty, 
 * all metrics are returned.
 * 
 * TODO: dimensionSpecs can't be null! Needed to finish according to Druid docs.
 */
//var createGeneralSelectDruidQueryBase = function (dimensions, metrics) {
//    var queryJson = {};
//    queryJson.query = {};
//    queryJson.query.queryType = "topN";
//    queryJson.query.dataSource = "InfiSpectorTopic";
//    queryJson.query.granularity = "all";
//    queryJson.query.dimensions = dimensions;
//    queryJson.query.metrics = metrics;
//    queryJson.query.threshold = "10000";
//    return queryJson;
//}

/**
 * 
 * @param queryJson - mandatory
 * @param filterOperand - use 'and' or 'or'
 * @param srcNode - mandatory
 * @param destNode - optional
 * @param searchMessageText - optional - runs 'insensitive_contains' on dimension 'message' 
 */
var setFilterToDruidQueryBase = function (queryJson, filterOperand, srcNode, destNode, searchMessageText) {

    queryJson.query.filter = {};
    queryJson.query.filter.type = filterOperand;
    queryJson.query.filter.fields = [];

    queryJson.query.filter.fields.push({
        "type": "selector",
        "dimension": "src",
        "value": srcNode});

    if (destNode) {
        queryJson.query.filter.fields.push({
            "type": "selector",
            "dimension": "dest",
            "value": destNode});
    }

    if (searchMessageText) {
        queryJson.query.filter.fields.push({
            "type": "search",
            "dimension": "message",
            "query": {
                "type": "insensitive_contains",
                "value": searchMessageText
            }});
    }
}

/**
 * @param queryJson - mandatory
 * @param type - mandatory
 * @param fieldName - mandatory
 * @param name - mandatory
 */
var setAggregationsToDruidQueryBase = function (queryJson, type, fieldName, name) {
    queryJson.query.aggregations = [];
    queryJson.query.aggregations.push({"type": type, "fieldName": fieldName, "name": name});
}

/**
 * @param queryJson - mandatory
 * @param fromTime - optional
 * @param toTime - optional 
 */
var setIntervalsToDruidQueryBase = function (queryJson, fromTime, toTime) {
    if (fromTime && toTime) {
        queryJson.query.intervals = [fromTime + "/" + toTime];
    } else {
        console.log("In setIntervalsToDruidQueryBase: fromTime or toTime not specified, using default 50 years (2000-2050).")
        queryJson.query.intervals = ["2000-10-01T00:00/2050-01-01T00"];
    }
}