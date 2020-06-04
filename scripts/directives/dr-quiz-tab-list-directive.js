'use strict';

var drQuizTabListDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/drquiz/drQuizTabList.html'
	};
};

angular.module('ocatApp').directive('drQuizTabListDirective', drQuizTabListDirective);
