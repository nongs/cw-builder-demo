'use strict';

var uolDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/uolTemplate.html'
	};
};

angular.module('ocatApp').directive('uolDirective', uolDirective);
