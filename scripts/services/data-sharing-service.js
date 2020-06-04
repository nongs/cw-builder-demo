'use strict';

angular.module('ocatApp').service('dataSharingService', function() {
	this.hide_cw = false;		// CW 출력여부
	this.hide_poll = true;	// 설문지 출력여부
});

// 각 Controller가 데이터를 공유하는 Service. //
angular.module('ocatApp').factory('configData', function() {
	var host = {};
	host.hostname;
	host.port;

	return host;
});
