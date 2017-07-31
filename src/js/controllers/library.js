/*jshint loopfunc: true */

app.controller('InfiSpectorCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';
        
        $scope.nodeMessagesInfo;
        $scope.index;
        $scope.hidden = true;
        $scope.legendHidden = true;
        
        $scope.connectToDruid = function () {

            // see configure-routes.js for the path
            var request = $http.post('/connectDruid?' +
                    "payload=" + 'some json stuff' +
                    "&myQuery=" + 'my custom query' +
                    "&attribute=" + 'some other attributes'
                    );
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.queryResults = response.data.jsonResponseAsString;

                    var objects = JSON.parse($scope.queryResults);
                    console.log(objects);
                }
            });
        };

        $scope.getNodes = function () {
            var request = $http.post('/getNodes');
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    // TODO: better array / string handling, develop some contract
                    console.log(response.data.jsonResponseAsString);
                    var nodes = response.data.jsonResponseAsString.replace("[", "").replace("]","").split(",");
                    return nodes;
                }
            });
        };
        
        /*
         * function gets all messages with info about specific node
         * @param nodeName contains name of node
         */
        
        $scope.getNodeInfo = function (nodeName, filter) {
            $scope.index = 0;
            console.log(filter);
            var request = $http.post('/getMessagesInfo', 
            {
                "nodeName": nodeName,
                "filter": filter
            });
            request.then(function (response) {
//               $scope.nodeMessageInfo = response.data.jsonResponseAsString;
                var parsed = JSON.parse(response.data.jsonResponseAsString)[0];
                $scope.nodeMessagesInfo = [];
                for (var i = 0; i < parsed.result.length; i++) {
                    $scope.nodeMessagesInfo[i] = "\nnode name: " + nodeName + "\ncount: " + parsed.result[i].length + "\nmessage: " + parsed.result[i].message + "\n\n\n" + (i + 1) + "/" + parsed.result.length;
                    //$scope.nodeMessagesInfo[i] = $scope.nodeMessagesInfo[i].split(",").join('\n').replace("^\"", "").replace("$\"", "");      // funny -> replace didnt work out for me
                }
                $scope.messageInfo = $scope.nodeMessagesInfo[0];
            });
        };
        
        /*
         * function returning 1 message info so it could be displayed
         */
        
        $scope.nextNodeMessageInfo = function() {
            $scope.index++;
            if (($scope.index % $scope.nodeMessagesInfo.length) === 0) $scope.index = 0;
            $scope.messageInfo = $scope.nodeMessagesInfo[$scope.index];
        };
        
        $scope.prevNodeMessageInfo = function() {
            $scope.index--;
            if ($scope.index < 0) $scope.index = $scope.nodeMessagesInfo.length-1;
            $scope.messageInfo = $scope.nodeMessagesInfo[$scope.index];
        };
        
        $scope.drawGraph = function (addedFilter) {
            var filters = "";
            if (addedFilter) {
                filters = document.getElementById("inputFilter").value;
                filters = filters.replace(" ", "");
            }
            else {
                deleteGraphs();
                filters = "SingleRpcCommand,CacheTopologyControlCommand,StateResponseCommand,StateRequestCommand";
            }
            var element = document.getElementById("cmn-toggle-7");
            if (element.checked) {      //flow chart
                $scope.flowChart(filters);
            }
            else {  //chord diagram
                $scope.chordDiagram(filters);
            }
        };
        
        // TODO: we will need more flowCharts in the dashboard 
        // TODO: create matrix/array of flowcharts
        $scope.flowChart = function (messages) {
            messages = messages.split(",");
            var times = getSelectedTime();
            var from = times[0];
            var to = times[1];
            //var from = document.getElementById("valR").value;
            //var to = document.getElementById("valR2").value;
            // TODO: dynamically for each chart on dashboard
            // SingleRpcCommand, CacheTopologyControlCommand 
            // StateResponseCommand, StateRequestCommand
//            var searchMessageText = document.getElementById("searchMessageText").value;
            var searchMessageText = ""; // "" means show all messages, no filter
            $scope.getNodes().then(function (nodes) {
                var numberOfNodesInGroup = document.getElementById("nodesInGroup").value;
                var nodesArrayInJson = [];
                var tmp = 0;
                var index1 = nodes.indexOf("\"null\"");
                $scope.groupLegend = "";
                nodes.splice(index1, 1);
                if (numberOfNodesInGroup >= 1) {
                    for (var index = 0; index < nodes.length; index++) {
                        tmp = Math.floor(index / numberOfNodesInGroup);
                        if (Math.ceil(index / numberOfNodesInGroup) - tmp === 0) {
                            nodesArrayInJson[tmp] = [];
                        }
                        nodesArrayInJson[tmp][index % numberOfNodesInGroup] = {"nodeName": nodes[index]};
                    }
                    nodesArrayInJson.push([]);
                    nodesArrayInJson[nodesArrayInJson.length - 1][0] = {"nodeName": "\"null\""};
                }
                else {
                    displayGrowl('Number of nodes in group must be greater than 0');
                }
                if (numberOfNodesInGroup > 1) {
                        for (var i = 0; i < nodesArrayInJson.length; i++) {
                            if (nodesArrayInJson[i].length > 1) {
                                $scope.groupLegend += "\ngroup" + i.toString() + ":\n";
                                for (var j1 = 0; j1 < nodesArrayInJson[i].length; j1++) {
                                    $scope.groupLegend += nodesArrayInJson[i][j1].nodeName + "\n";
                                }
                                $scope.groupLegend += "\n";
                            }
                        }
                        $scope.legendHidden = false;
                }
                else {
                    $scope.legendHidden = true;
                }
                for (var j = 0; j < messages.length; j++) {
                    searchMessageText = messages[j];
                    var request = $http.post("/getFlowChartMatrix",
                        {
                            "nodes": nodesArrayInJson,
                            "searchMessageText" : searchMessageText
                        });
                    request.then(function (response) {
                       if (response.data.error > 0) {
                           console.log("ERROR: response.data.error > 0");
                       } 
                       else {
                            var matrix = JSON.parse(response.data.matrix);
                            var searchMessage = JSON.parse(response.data.searchMessage);
                            messageFlowChart(nodes, matrix, searchMessage);
                       }
                    });
                }
            });
            $scope.hidden = false;
            return 0;
        };

        $scope.chordDiagram = function (messages) {
            messages = messages.split(",");
            var times = getSelectedTime();
            var from = times[0];
            var to = times[1];
            //var from = document.getElementById("valR").value;
            //var to = document.getElementById("valR2").value;
            
            // @vhais, please, you can follow $scope.getNodes() for flow chart, we will duplicate code for now, probably
            // TODO: the whole function $scope.getNodes() is not a promise
            // TODO: call $http.post('/getNodes'); separately before $http.post("/getChordDiagramMatrix... in one function
            // TODO: use $http.post("/getChordDiagramMatrix", { "nodes": nodesArrayInJson }); to properly pass parameters
            var searchMessageText = "";
            $scope.getNodes().then(function (nodes) {
                var nodesArrayInJson = [];
                for (var i = 0; i < nodes.length; i++) {
                    nodesArrayInJson[i] = {"nodeName": nodes[i]};
                    nodes[i] = JSON.parse(nodes[i]);
                }
                for (var j = 0; j < messages.length; j++) {
                    searchMessageText = messages[j];
                    var request = $http.post("/getChordDiagramMatrix",
                        {
                            "nodes": nodesArrayInJson,
                            "searchMessageText" : searchMessageText
                        });
                    request.then(function (response) {
                        if (response.data.error > 0) {
                            console.log("ERROR: response.data.error > 0");
                        } else {
                            var chord_options = {
                                "gnames": nodes,
                                "rotation": -0.7,
                                "colors": ["rgb(233,222,187)", "rgb(255,205,243)", "rgb(255,255,155)",
                                    "rgb(0,0,0)", "rgb(87,87,87)", "rgb(173,35,35)",
                                    "rgb(42,75,215)", "rgb(29,105,20)", "rgb(129,74,25)",
                                    "rgb(255,146,51)", "rgb(255,238,51)", "rgb(129,38,192)",
                                    "rgb(160,160,160)", "rgb(129,197,122)", "rgb(157,175,215)",
                                    "rgb(41,208,208)"]
                            };
                            var matrix = JSON.parse(response.data.matrix);
                            var searchMessage = JSON.parse(response.data.searchMessage);
                            chordDiagram(chord_options, matrix, searchMessage);
                        }
                    });
                }
            });
            $scope.hidden = false;
        };

    }]);

app.controller('OperationsCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';

        $scope.keyToPut = "k1";
        $scope.valueToPut = "v1";
        $scope.nodeToPut = "11222";
        $scope.keyToGet = "k1";
        $scope.putNumber = null;

        $scope.putEntry = function () {

            // see configure-routes.js for the path
            var request = $http.post('/putEntry',
                    {
                        keyToPut: $scope.keyToPut,
                        valueToPut: $scope.valueToPut,
                        nodeToPut: $scope.nodeToPut,
                        putNumber: $scope.putNumber
                    });

            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.currentNumberOfEntriesAfterPut = response.data.jsonObjects.currentNumberOfEntries;
                    $scope.clusterMembers = response.data.jsonObjects.clusterMembers;

                    drawChart();
                }
            });
        };

        $scope.getEntry = function () {

            // see configure-routes.js for the path
            var request = $http.post('/getEntry',
                    {
                        keyToGet: $scope.keyToGet
                    });

            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.valueReturned = response.data.valueReturned;
                }
            });
        };
        
        /**
         * @todo drawChart after clear cache
         */
        $scope.clearCache = function () {
            var request = $http.post('/clearCache', {});
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.currentNumberOfEntriesAfterPut = response.data.jsonObjects.currentNumberOfEntries;
                    $scope.clusterMembers = response.data.jsonObjects.clusterMembers;
                    
                    drawChart();
                }
            });
        };
        
        $scope.initZoomableChart = function () {
            var request = $http.post('/initZoomableChart', {});

            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.currentNumberOfEntriesAfterPut = response.data.jsonObjects.currentNumberOfEntries;
                    $scope.clusterMembers = response.data.jsonObjects.clusterMembers;
                    
                    drawChart();
                }
            });
        };
        
        $scope.initZoomableChart();

    }]);
