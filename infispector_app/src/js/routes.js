app.config(['$routeProvider', function ($routeProvider) {
        'use strict';


        $routeProvider.when('/', {
            templateUrl: '/index.html'
        }).when('/operations', {
            templateUrl: '/operations.html'
        })
                .otherwise({
                    redirectTo: '/'
                });
    }]); 