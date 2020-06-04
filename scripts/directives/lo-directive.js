'use strict';

var loDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/loTemplate.html'
	};
};

angular.module('ocatApp').directive('loDirective', loDirective);
