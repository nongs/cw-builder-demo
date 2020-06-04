'use strict';

var adminController = function($scope, AdminConfig) {
	$scope.domain = '';
	$scope.hostname = '';
	$scope.port = '';
	$scope.username = '';
	$scope.password = '';

	AdminConfig.getData().then(function(response){
		$scope.domain = response[0].domain;
		$scope.hostname = response[0].hostname;
		$scope.port = response[0].port;
		$scope.username = response[0].username;
		$scope.password = response[0].password;
	});

	$scope.putData = function(){
		AdminConfig.putData({domain:$scope.domain,hostname:$scope.hostname,port:$scope.port,username:$scope.username,password:$scope.password});
	};
};

angular.module('ocatApp').controller('adminController', adminController);
