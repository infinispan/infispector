var app = require('../../app.js');

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