'use strict';

var pollDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/pollTemplate.html'
	};
};

// 객관식 //
var pollSingleChoiceDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/pollSingleChoiceTemplate.html'
	};
};

// 단답형 //
var pollShortAnswerDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/pollShortAnswerTemplate.html'
	};
};

// 서술형 //
var pollDescriptionDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/pollDescriptionTemplate.html'
	};
};

angular.module('ocatApp').directive('pollDirective', pollDirective);
angular.module('ocatApp').directive('pollSingleChoiceDirective', pollSingleChoiceDirective);
angular.module('ocatApp').directive('pollShortAnswerDirective', pollShortAnswerDirective);
angular.module('ocatApp').directive('pollDescriptionDirective', pollDescriptionDirective);
