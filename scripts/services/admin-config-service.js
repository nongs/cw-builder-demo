'use strict';

function AdminConfig($http, $q) {
    return {
    	putData: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/admin/save', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     deferred.reject(response);
            // });
            deferred.resolve({});
            return deferred.promise;
        },
        getData: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/admin/retrieve').success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     deferred.reject(response);
            // });
            deferred.resolve({});
            return deferred.promise;
        }
    };
}

angular.module('ocatApp').factory('AdminConfig', AdminConfig);

AdminConfig.$inject = ['$http', '$q'];
