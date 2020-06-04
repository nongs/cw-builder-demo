'use strict';

angular.module('ocatApp').constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
}).constant('API_ENDPOINT', {
    url: baseUrl + '/api',
    imageUrl: baseUrl
}).constant('COURSE_VALIDATION', {
    notValidation: 'course-not-validated',
    validationKey: '#'
});
