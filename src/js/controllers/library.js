/*jshint loopfunc: true */

app.controller('InfiSpectorCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';
        
        $scope.nodeMessagesInfo;
        $scope.index;
        $scope.hidden = true;
        $scope.legendHidden = true;
        $scope.loadingBarHidden = true;

        $scope.calculateDefaultUnits = function() {
            var unitOrder = ["hours", "minutes", "seconds", "milliseconds"];
            $scope.getFirstMessageTime().then(function (firstMessageTime) {
                $scope.getLastMessageTime().then(function (lastMessageTime) {
                    var start = new Date(firstMessageTime);
                    var end = new Date(lastMessageTime);
                    var difference = end.getTime() - start.getTime();
                    if (difference < 1000) {
                        timeLine("milliseconds");
                        return;
                    }
                    difference = Math.floor(difference / 1000);
                    for (var i = unitOrder.length - 2; i >= 0; i--) {
                        if (difference < 60 || i === 0) {
                            timeLine(unitOrder[i]);
                            return;
                        }
                        difference = Math.floor(difference / 60);
                    }
                });
            });
        };

        $scope.getFirstMessageTime = function() {
            var request = $http.post('/getMinimumMessageTime');
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    var res = response.data.jsonResponseAsString;
                    return JSON.parse(res)[0].timestamp;
                }
            });
        };

        $scope.getLastMessageTime = function() {
            var request = $http.post('/getMaximumMessageTime');
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    var res = response.data.jsonResponseAsString;
                    return JSON.parse(res)[0].timestamp;
                }
            });
        };

        $scope.getMessagesCountInInterval = function (timeFrom, timeTo) {
            console.log(timeTo);
            var request = $http.post('/getMsgCnt',
                {
                    "fromTime": timeFrom.toISOString(),
                    "toTime": timeTo.toISOString()
                });
            return request.then(function (response) {
                console.log(response.data.jsonResponseAsString);
                return response.data.jsonResponseAsString;
            });
        };
        
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
        
        $scope.getNodeInfo = function (nodeName, filter, srcDest) {
            $scope.index = 0;
            console.log(filter);
            var request = $http.post('/getMessagesInfo', 
            {
                "srcNode": (!srcDest) ? nodeName : null,
                "destNode": (srcDest) ? nodeName : null,
                "filter": filter
            });
            request.then(function (response) {
//               $scope.nodeMessageInfo = response.data.jsonResponseAsString;
                var parsed = JSON.parse(response.data.jsonResponseAsString)[0];
                $scope.nodeMessagesInfo = [];
                for (var i = 0; i < parsed.result.length; i++) {
                    $scope.nodeMessagesInfo[i] = "\nnode name: " + nodeName + "\ncount: " + parsed.result[i].length + "\nmessage: " + parsed.result[i].message + "\n\n\n" + (i + 1) + "/" + parsed.result.length;
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
            filters = filters.split(",");
            var element = document.getElementById("cmn-toggle-7");
            var graphClass = document.getElementsByClassName("graph");
            var filtersUsed = [];
            if (graphClass.length > 0) {
                for (var i = 0; i < graphClass.length; i++) {
                    filtersUsed.push(graphClass[i].childNodes[0].innerText);
                }
            }
            for (var j = 0; j < filters.length; j++) {
                if (filtersUsed.indexOf(filters[j]) > -1) {
                    displayGrowl(filters[j] + " filter already used");
                    filters.splice(j, 1);
                }
            }
            if (filters.length > 0) {
                $scope.loadingBarHidden = false;
                $scope.flowChart(filters);
            }
            // if (element.checked) {      //flow chart
            //     $scope.flowChart(filters);
            // }
            // else {  //chord diagram
            //     $scope.chordDiagram(filters);
            // }
        };

        $scope.getMatrix = function (nodes, filter, filterCount, callback) {
            var requestsRemaining = Math.pow(nodes.length, 2);
            var matrix = [];
            var groupNames = [];
            var onePercent = (requestsRemaining * filterCount) * 0.01;
            nodes.push(nodes.splice(nodes.indexOf("\"null\""), 1)[0]);
            var numberOfNodesInGroup = parseInt(document.getElementById("nodesInGroup").value, 10);
            if (numberOfNodesInGroup > 1) {
                for (var i = 0; i < Math.ceil(nodes.length / numberOfNodesInGroup); i++) {
                    groupNames.push(JSON.stringify("group" + i));
                }
                $scope.groupLegend = "";
                $scope.legendHidden = false;
            }
            else {
                groupNames = nodes;
                $scope.legendHidden = true;
            }
            for (var i1 = 0; i1 < nodes.length; i1++) {
                if (i1 % numberOfNodesInGroup === 0 && i1 !== nodes.length - 1) {
                    $scope.groupLegend += "\ngroup" + i1 / numberOfNodesInGroup + ":\n";
                }
                if (i1 !== nodes.length - 1) {
                    $scope.groupLegend += nodes[i1] + "\n";
                }
                for (var i2 = 0; i2 < nodes.length; i2++) {
                    var request = $http.post("/getMessagesCount",
                        {
                            "srcNode": nodes[i1],
                            "destNode": nodes[i2],
                            "searchMessageText": filter,
                            "groupSrc": groupNames[Math.floor(i1 / numberOfNodesInGroup)],
                            "groupDest": groupNames[Math.floor(i2 / numberOfNodesInGroup)]
                        });
                    request.then(function (response) {
                        if (response.data.error > 0) {
                            console.log("ERROR: response.data.error > 0");
                        }
                        else {
                            var res = response.data.result;
                            res = JSON.parse(res);
                            res[2] = parseInt(res[2], 10);
                            matrix.push(res);
                            --requestsRemaining;
                            ++requestsRemainingToPercent;
                            if (requestsRemainingToPercent >= onePercent) {
                                console.log(requestsRemainingToPercent);
                                requestsRemainingToPercent = 0;
                                if (onePercent < 1) {
                                    frame(1/onePercent);
                                }
                                else {
                                    frame(1);
                                }
                            }
                            if (requestsRemaining <= 0) {
                                if (numberOfNodesInGroup > 1) {
                                    var tmp;
                                    for (var i = 0; i < matrix.length; i++) {
                                        for (var j = 0; j < matrix.length; j++) {
                                            if (i === j) {
                                                continue;
                                            }
                                            if (matrix[i][0] === matrix[j][0] && matrix[i][1] === matrix[j][1]) {
                                                tmp = matrix[j][2];
                                                matrix.splice(j, 1);
                                                matrix[i][2] = parseInt(tmp, 10) + parseInt(matrix[i][2], 10);
                                                j--;
                                            }
                                        }
                                    }
                                }
                                callback(matrix, JSON.parse(response.data.searchMessageText));
                            }
                        }
                    });
                }
            }
        };
        
        // TODO: we will need more flowCharts in the dashboard 
        // TODO: create matrix/array of flowcharts
        $scope.flowChart = function (filters) {
            // filters = filters.split(",");
            // var times = getSelectedTime();
            // var from = times[0];
            // var to = times[1];
            // SingleRpcCommand, CacheTopologyControlCommand
            // StateResponseCommand, StateRequestCommand
//            var searchMessageText = document.getElementById("searchMessageText").value;
            var searchMessageText = ""; // "" means show all messages, no filter
            $scope.getNodes().then(function (nodes) {
                for (var j = 0; j < filters.length; j++) {
                    searchMessageText = filters[j];
                    $scope.getMatrix(nodes, searchMessageText, filters.length, function (matrix, filter) {
                        cnt++;
                        messageFlowChart(nodes, matrix, filter, cnt === filters.length);
                    });
                }
            });
            $scope.hidden = false;
            return 0;
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
