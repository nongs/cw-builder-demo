'use strict';

function loginCtrl($scope, AuthService, $state) {
	$scope.user = {
		name: '',
		password: ''
	};

	$scope.login = function() {
		AuthService.login($scope.user).then(function(msg) {
			$state.go('adminpage');
		}, function(errMsg) {
			console.log(msg);
		});
	};
}

function registerCtrl($scope, AuthService, $state) {
	$scope.user = {
		name: '',
		password: ''
	};

	$scope.signup = function() {
		AuthService.register($scope.user).then(function(msg) {
			$state.go('user.login');
			console.log(msg);
		}, function(errMsg) {
			console.log(errMsg);
		});
	};
}

function insideCtrl($scope, AuthService, API_ENDPOINT, $http, $state) {
	$scope.destroySession = function() {
		AuthService.logout();
	};

	$scope.getInfo = function() {
		$http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
			$scope.memberinfo = result.data.msg;
		});
	};

	$scope.logout = function() {
		AuthService.logout();
		$state.go('user.login');
	};
}

function appCtrl($scope, $state, AuthService, AUTH_EVENTS) {
	$scope.homepage = siteURL;

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout();
		$state.go('user.login');
		console.log('session lost');
	});
}

angular.module('ocatApp').controller('loginCtrl', loginCtrl);
angular.module('ocatApp').controller('registerCtrl', registerCtrl);
angular.module('ocatApp').controller('insideCtrl', insideCtrl);
angular.module('ocatApp').controller('appCtrl', appCtrl);
