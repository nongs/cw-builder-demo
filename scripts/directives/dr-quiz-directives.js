'use strict';

var drQuizSingleChoiceDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/drquiz/drQuizSingleChoice.html'
	};
};

angular.module('ocatApp').directive('drQuizSingleChoiceDirective', drQuizSingleChoiceDirective);
