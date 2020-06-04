'use strict';

var drgDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drgTemplate.html'
	};
};

angular.module('ocatApp').directive('drgDirective', drgDirective);
