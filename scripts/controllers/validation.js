'use strict';

// var validationCtrl = function ($scope, $location, ValidationCourseInfo, COURSE_VALIDATION, $stateParams) {
// 	var LOCAL_TOKEN_KEY = 'validationSuccess';
// 	var temp = $stateParams.validparam.split('_____');
// 	var encrypted = temp[0];
// 	ValidationCourseInfo.getData({data:encrypted}).then(function(response){
// 		//console.log(response);
// 		if(response.validation == null) {
// 			location.href = "#/page/error/403";
// 		}
// 		else if(response.validation == true) {
// 			ValidationCourseInfo.getDecryptData({data: encrypted}).then(function(response2){
// 				window.localStorage.setItem('uid', response2.uid);
// 				window.localStorage.setItem('Title', response2.origin_title);
// 				window.localStorage.setItem(LOCAL_TOKEN_KEY, encrypted.toString());
// 				window.sessionStorage.setItem('yourTokenKey', response.token.toString());
// 	            window.sessionStorage.setItem('sessid', response.sessid.toString());
// 	            window.sessionStorage.setItem('session_name', response.session_name.toString());
// 	            window.sessionStorage.setItem('drupaltoken', response.drupaltoken.toString());
// 	            window.sessionStorage.setItem('username', temp[1]);
// 				location.href = "#/courseware/create/" + response.coursecid;
// 			});
// 		}
// 	});
// };

var validationCtrl = function ($scope, $location, ValidationCourseInfo, COURSE_VALIDATION, $stateParams) {
	var LOCAL_TOKEN_KEY = 'validationSuccess';
	var encrypted = $stateParams.validparam;
	ValidationCourseInfo.getData({data:encrypted}).then(function(response){
		if(response.validation == 'ie') {
			location.href = "#/page/error/ie";
		}
		if(response.validation == null) {
			location.href = "#/page/error/403";
		}
		else if(response.validation == true) {
			window.localStorage.setItem('uid', response.courseuid);
			window.localStorage.setItem('userrole', response.userrole);
			window.localStorage.setItem('cid', response.coursecid);
			window.localStorage.setItem('Title', response.origin_title);
			window.localStorage.setItem(LOCAL_TOKEN_KEY, encrypted.toString());
			window.sessionStorage.setItem('yourTokenKey', response.token.toString());
            window.sessionStorage.setItem('sessid', response.sessid.toString());
            window.sessionStorage.setItem('session_name', response.session_name.toString());
            window.sessionStorage.setItem('drupaltoken', response.drupaltoken.toString());
            window.sessionStorage.setItem('username', response.username);
			location.href = "#/courseware/create/" + encodeURIComponent(response.coursecid);
		}
	});
};

angular.module('ocatApp').controller('validationCtrl', validationCtrl);
