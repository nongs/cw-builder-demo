'use strict';

// 설문지 제어 //
var pollController = function($scope, $mdDialog, $mdMedia, $location, $anchorScroll, dataSharingService) {
	$scope.hide_poll = dataSharingService.hide_poll;
	$scope.pollList = {
		id:randomString(32),
		type:'poll',
		title:'',
	};

	$scope.show_poll = function() {
		angular.element('#dr_container').hide();
		angular.element('#poll_controller').show();
		/*
		if(dataSharingService.hide_poll == true) {
			// CW를 hide 시킨다. //
			dataSharingService.hide_cw = true;
			dataSharingService.hide_poll = false;
		}
		*/
	};

	$scope.dataSharingService = function(name) {
		$scope.my_name = name;
		console.log('before = ' + $scope.my_name);
		$scope.my_name = dataSharingService.sharingData.enable_poll;
		console.log('after = ' + $scope.my_name);
	}
};

angular.module('ocatApp').controller('pollController', pollController);
