'use strict';

var drMediaDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drMediaTemplate.html'
	};
};
var drQuizDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drQuizTemplate.html'
	};
};
var drDiscussionDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drDiscussionTemplate.html'
	};
};
var drTextDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drTextTemplate.html'
	};
};
var drImageDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drImageTemplate.html'
	};
};
var drFileDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drFileTemplate.html'
	};
};
var drHomeworkDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drHomeworkTemplate.html'
	};
};
var drLtiDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drLtiTemplate.html'
	};
};
var drNoneDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/drNoneTemplate.html'
	};
};
var surveyNoneDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/surveyNoneTemplate.html'
	};
};
var surveyScDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/surveyScTemplate.html'
	};
};
var surveySaDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/surveySaTemplate.html'
	};
};
var surveyDescriptionDirective = function() {
	return {
		restrict : 'E',
		templateUrl : 'views/templates/surveyDescriptionTemplate.html'
	};
};
var relinkEvent = function($rootScope) {
	return {
		transclude: 'element',
		restrict : 'A',
		link: function(scope, element, attr, ctrl, transclude){
			var previousContent = null;

			var triggerRelink = function(){
				if(previousContent){
					previousContent.remove();
					previousContent = null;
				}

				transclude(function(clone){
					console.log('relink');
					element.parent().append(clone);
					previousContent = clone;
				});
			}

			triggerRelink();
			$rootScope.$on(attr.relinkEvent, triggerRelink);
		}
	};
};

angular.module('ocatApp').directive('drMediaDirective', drMediaDirective);
angular.module('ocatApp').directive('drQuizDirective', drQuizDirective);
angular.module('ocatApp').directive('drDiscussionDirective', drDiscussionDirective);
angular.module('ocatApp').directive('drTextDirective', drTextDirective);
angular.module('ocatApp').directive('drImageDirective', drImageDirective);
angular.module('ocatApp').directive('drFileDirective', drFileDirective);
angular.module('ocatApp').directive('drHomeworkDirective', drHomeworkDirective);
angular.module('ocatApp').directive('drLtiDirective', drLtiDirective);
angular.module('ocatApp').directive('drNoneDirective', drNoneDirective);
angular.module('ocatApp').directive('surveyNoneDirective', surveyNoneDirective);
angular.module('ocatApp').directive('surveyScDirective', surveyScDirective);
angular.module('ocatApp').directive('surveySaDirective', surveySaDirective);
angular.module('ocatApp').directive('surveyDescriptionDirective', surveyDescriptionDirective);
angular.module('ocatApp').directive('relinkEvent', relinkEvent);
