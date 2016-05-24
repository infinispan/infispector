app.controller('InfiSpectorCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';

        $scope.connectToDruid = function () {

            // see configure-routes.js for the path
            var request = $http.post('/connectDruid?' +
                        "payload=" + 'some json stuff' +
                        "&myQuery="  + 'my custom query' +
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
        
        $scope.getNodes = function() {
            var request = $http.post('/getNodes');
            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                }
                else {
                    return response.data.jsonResponseAsString;
                }
            });
            //return [ "Node1", "Node2", "Node3", "Node4", "Node5", "Node6", "Node7", "Node8",
            //"Node9", "Node10", "Node11", "Node12", "Node13", "Node14", "Node15", "Node16"];
        };
        
//        $scope.getNumberOfMessages = function(srcNode, destNode, from, to) {
//            var request = $http.post('/getNumberOfMessages?' +
//                          'srcNode=' + srcNode +
//                          'destNode=' + destNode +
//                          'from=' + from +
//                          'to=' + to);
//        };

        $scope.flowChart = function() {
            var from = document.getElementById("valR").value;
            var to = document.getElementById("valR2").value;
            $scope.getNodes().then(function (response) {
                var nodes = response.data.nodes;
                var request = $http.post("/getFlowChartMatrix?" +
                                "from=" + from +
                                "&to=" + to +
                                "&nodes=" + nodes);
                return request.then(function (response) {
                   if (response.data.error > 0) {
                       console.log("ERROR: response.data.error > 0");
                   } 
                   else {
                       var matrix = JSON.parse(response.data.matrix);
                       messageFlowChart(nodes, response.data.matrix);
                   }
                });
            });
        };
        
        $scope.chordDiagram = function() {
            var from = document.getElementById("valR").value;
            var to = document.getElementById("valR2").value;
            $scope.getNodes().then(function (response) {
                var nodes = response.data.nodes;
                var request = $http.post("/getChordDiagramMatrix?" +
                                "from=" + from +
                                "&to=" + to +
                                "&nodes=" + nodes);
                return request.then(function (response) {
                   if (response.data.error > 0) {
                       console.log("ERROR: response.data.error > 0");
                   }
                   else {
                       var chord_options = {
                            "gnames": nodes,
                            "rotation": -0.7,
                            "colors": ["rgb(233,222,187)","rgb(255,205,243)","rgb(255,255,155)",
                                       "rgb(0,0,0)","rgb(87,87,87)","rgb(173,35,35)",
                                       "rgb(42,75,215)","rgb(29,105,20)","rgb(129,74,25)",
                                       "rgb(255,146,51)","rgb(255,238,51)","rgb(129,38,192)",
                                       "rgb(160,160,160)","rgb(129,197,122)","rgb(157,175,215)",
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