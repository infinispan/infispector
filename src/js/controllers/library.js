app.controller('InfiSpectorCtrl', ['$scope', '$http', function ($scope, $http) {
        'use strict';

        $scope.connectToDruid = function () {

            // see configure-routes.js for the path
            var request = $http.post('/connectDruid',
                    {
                        payload: 'some json stuff',
                        myQuery: 'my custom query',
                        attribute: 'some other attributes'
                    });

            return request.then(function (response) {
                if (response.data.error === 1) {
                    console.log('ERROR: response.data.error === 1');
                } else {
                    console.log('Post request was called without error.');
                    $scope.queryResults = response.data.jsonObjects;
                }
            });
        };
    }]);