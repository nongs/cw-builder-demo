'use strict';

function indexController($scope, OcatToMongoDb) {
    $scope.hostname = '';
    OcatToMongoDb.getHostName({nid:$scope.cwNid}).then(function(response) {
        $scope.hostname = response;
        location.href = 'http://' + $scope.hostname;
    });
}

angular.module('ocatApp').controller('indexController', indexController);
