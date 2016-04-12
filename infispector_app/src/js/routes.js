app.config(['$routeProvider', function ($routeProvider) {
    'use strict';


    $routeProvider.when('/', {
        templateUrl: '/index.html',
        controller: 'LibraryCtrl'
    })
            .otherwise({
                           redirectTo: '/'
                       });
}]);