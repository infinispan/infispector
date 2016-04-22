var app = require('../../app.js');

var RSVP = require('rsvp');
var infinispan = require('infinispan');
// replace JSON file for generating new updated zoomable chart
var jsonfile = require('jsonfile');
var file = './app/assets/flare.json';

function updateJsonForChart(member) {

    return new Promise(function (resolve, reject) {

        var nodeElement;
        var nodeChildren = [];

        var host = member.host;
        var port = member.port;

        var connected = infinispan.client({port: port, host: host});

        connected.then(function (client) {

            client.stats().then(
                    function (stats) {

                        // TODO: implement proper logging
                        console.log("***** getCurrentEntriesForMember: " +
                                host + ":" + port + " currEntries= " + stats.currentNumberOfEntries);

                        for (x = 0; x < stats.currentNumberOfEntries; x++) {
                            nodeChildren[x] = {"name": "a key", "size": 30};
                        }

                        nodeElement = {
                            "name": host + "_" + port,
                            "children": nodeChildren
                        };

                        resolve(nodeElement);
                    },
                    function (err) {
                        // TODO: implement better and proper error handling
                        console.log("Getting stats failed.", err);
                    });
        },
                function (err) {
                    console.log("Connected failed.", err);
                });
    }); // promise
}

exports.putEntry = function (req, res) {

    console.log('Operating with Infinispan api.ispn.putEntry....' +
            "key: " + req.body.keyToPut + " val: " + req.body.valueToPut +
            " node: " + req.body.nodeToPut);

    // TODO -- user decides node / port
    var connected = infinispan.client({port: 11222, host: '127.0.0.1'});

    connected.then(function (client) {

        var members = client.getTopologyInfo().getMembers();
        // Should show all cluster members
        console.log('***** Connected to MEMBERS: ' + JSON.stringify(members) + ' members size ' + members.length);

        var clientPut = client.put(req.body.keyToPut, req.body.valueToPut);

        var clientStats = clientPut.then(
                function () {
                    return client.stats();
                });

        var showStats = clientStats.then(
                function (stats) {
                    
                    // TODO: put this stuff into standalone function
                    var nodeElements = [];
                    var promises = [];

                    for (i = 0; i < members.length; i++) {
                        promises[i] = updateJsonForChart(members[i]);
                    }

                    // each promise returns a nodeElement
                    RSVP.all(promises).then(function (nodeElements) {
                        // nodeElements now contains an array of results for the given promises 
                        // gather all results, continue

                        var newJson = {
                            "name": "flare",
                            "children": [
                                {
                                    "name": "Infinispan Cluster",
                                    "children": nodeElements
                                }
                            ]
                        };

                        jsonfile.writeFile(file, newJson, function (err) {
                            console.error(err);
                        });

                        // after JSON file update, return to client
                        res.send({error: 0, jsonObjects: {
                                currentNumberOfEntries: stats.currentNumberOfEntries,
                                clusterMembers: members}}, 201);

                    }).catch(function (reason) {                        
                        console.log("At least one of the promises FAILED: " + reason);
                    });
                });

        return showStats.finally(
                function () {
                    return client.disconnect();
                });

    }).catch(function (error) {
        console.log("***** Got error putEntry: " + error.message);
    });
};

exports.getEntry = function (req, res) {
    console.log('Operating with Infinispan api.ispn.getEntry.... ' +
            "key to get: " + req.body.keyToGet);
    res.send({error: 0, valueReturned: value}, 201);
};

