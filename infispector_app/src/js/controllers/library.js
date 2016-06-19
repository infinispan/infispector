app.controller('InfiSpectorCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';
        
        $scope.nodeMessagesInfo;
        $scope.index;
        
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
                    console.log("scope.getNodes: " + response.data.jsonResponseAsString);

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
        
        $scope.getNodeInfo = function (nodeName) {
            $scope.index = 0;
            var request = $http.post('/getMessagesInfo', 
            {
                "nodeName": nodeName
            });
            request.then(function (response) {
               $scope.nodeMessageInfo = response.data; 
            });
        };
        
        /*
         * function returning 1 message info so it could be displayed
         */
        
        $scope.nextNodeMessageInfo = function() {
            $scope.index++;
            if (($scope.index % $scope.nodeMessageInfo.length) === 0) $scope.index = 0;
            $scope.messageInfo = $scope.nodeMessageInfo[$scope.index];
        };
        
        $scope.prevNodeMessageInfo = function() {
            $scope.index--;
            if ($scope.index < 0) $scope.index = 0;
            $scope.messageInfo = $scope.nodeMessageInfo[$scope.index];
        };

        $scope.flowChart = function () {
            var from = document.getElementById("valR").value;
            var to = document.getElementById("valR2").value;
            $scope.getNodes().then(function (nodes) {
                var nodesArrayInJson = [];
                for (var i = 0; i < nodes.length; i++) {
                    nodesArrayInJson[i] = {"nodeName": nodes[i]}; 
                }
                var request = $http.post("/getFlowChartMatrix",
                    {
                        "nodes": nodesArrayInJson
                    });
                request.then(function (response) {
                   if (response.data.error > 0) {
                       console.log("ERROR: response.data.error > 0");
                   } 
                   else {
                        var matrix = JSON.parse(response.data.matrix);

                        console.log("-------- library.js get nodes + draw flow chart matrix: " + matrix);

                        messageFlowChart(nodes, matrix);
                   }
                });
            });
            return 0;
        };

        $scope.chordDiagram = function () {
            var from = document.getElementById("valR").value;
            var to = document.getElementById("valR2").value;
            
            // @vhais, please, you can follow $scope.getNodes() for flow chart, we will duplicate code for now, probably
            // TODO: the whole function $scope.getNodes() is not a promise
            // TODO: call $http.post('/getNodes'); separately before $http.post("/getChordDiagramMatrix... in one function
            // TODO: use $http.post("/getChordDiagramMatrix", { "nodes": nodesArrayInJson }); to properly pass parameters
            
            $scope.getNodes().then(function (nodes) {
                var nodesArrayInJson = [];
                for (var i = 0; i < nodes.length; i++) {
                    nodesArrayInJson[i] = {"nodeName": nodes[i]};
                    nodes[i] = JSON.parse(nodes[i]);
                }
                var request = $http.post("/getChordDiagramMatrix",
                    {
                        "nodes": nodesArrayInJson
                    });
                return request.then(function (response) {
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
                        chordDiagram(chord_options, matrix);
                    }
                });
            });
        };

    }]);

app.controller('OperationsCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';

        $scope.keyToPut = "k1";
        $scope.valueToPut = "v1";
        $scope.nodeToPut = "11222";
        $scope.keyToGet = "k1";

        $scope.putEntry = function () {

            // see configure-routes.js for the path
            var request = $http.post('/putEntry',
                    {
                        keyToPut: $scope.keyToPut,
                        valueToPut: $scope.valueToPut,
                        nodeToPut: $scope.nodeToPut
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

    }]);
