'use strict';

function OcatToMongoDb($http, $q) {
    return {
        getAllData: function(request) {
            var deferred = $q.defer();

            var arr = [];
            deferred.resolve(arr);

            return deferred.promise;
        },
        getNodeData: function(request) {
            // console.log(request);
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }

            var deferred = $q.defer();
            request.validationSuccess = window.localStorage.getItem('validationSuccess');

            // $http.post('/api/imoove/getnodedata', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     // console.log(response);
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        getHostName: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/admin/host/retrieve', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     // console.log(response);
            //     deferred.reject(response);
            // });
            return false;
            return deferred.promise;
        },
        getDomainName: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/admin/domain/retrieve', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     // console.log(response);
            //     deferred.reject(response);
            // });
            return false;
            return deferred.promise;
        },
        getData: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/ocat/time', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        putData: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            // $http.post('/api/ocat/create', request);
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
        },
        exportToEdxDownload: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.get('/api/ocat/edxexport/' + request.time).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        deleteDatas: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/ocat/delete', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        }
    };
}

function OcatToDrupal($http, $q) {
    return {
        exportToIMOOVE: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/coursebuilder/export-courseware', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        putData: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/ocat/node/create', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        updateData: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/ocat/node/update', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     // console.log(response);
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        loginDrupal: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();
            // $http.post('/api/ocat/login', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        getUser: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();
            // $http.post('/api/ocat/user/1', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        },
        getMyName: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();
            // $http.post('/api/ocat/users/retrieve', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        }
        // getSessionData: function(request) {
        //     var deferred = $q.defer();
        //     console.log("try get token");
        //     $http.post('/api/ocat/token').success(function(response) {
        //         console.log("get token success");
        //         deferred.resolve(response);
        //     }).error(function(response) {
        //         console.log("get token error");
        //         deferred.reject(response);
        //     });
        //     return deferred.promise;
        // }
    };
}

function GetContentsFromDb($http, $q) {
    return {
        getData: function(request) {
            if(window.sessionStorage.getItem('yourTokenKey')) {
                var token = window.sessionStorage.getItem('yourTokenKey');
                $http.defaults.headers.common.Authorization = token;
            }
            var deferred = $q.defer();

            // $http.post('/api/ocat/xinicscontents', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            if(window.sessionStorage.getItem('yourTokenKey')) {
                $http.defaults.headers.common.Authorization = null;
            }
            return deferred.promise;
        }
    };
}

function ValidationCourseInfo($http, $q) {
    return {
        getData: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/validation/retrieve', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            return deferred.promise;
        },
        getDecryptData: function(request) {
            var deferred = $q.defer();

            // $http.post('/api/validation/decrypt', request).success(function(response) {
            //     deferred.resolve(response);
            // }).error(function(response) {
            //     //location.href = '/#/page/error/404'
            //     deferred.reject(response);
            // });
            return false;
            return deferred.promise;
        }
    };
}

angular.module('ocatApp').factory('OcatToMongoDb', OcatToMongoDb);
angular.module('ocatApp').factory('OcatToDrupal', OcatToDrupal);
angular.module('ocatApp').factory('GetContentsFromDb', GetContentsFromDb);
angular.module('ocatApp').factory('ValidationCourseInfo', ValidationCourseInfo);

OcatToMongoDb.$inject = ['$http', '$q'];
OcatToDrupal.$inject = ['$http', '$q'];
ValidationCourseInfo.$inject = ['$http', '$q'];
GetContentsFromDb.$inject = ['$http', '$q'];
