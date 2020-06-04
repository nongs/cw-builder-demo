angular.module('ocatApp').commonsController = function($scope, $http, $q, Upload, $mdDialog, $mdMedia, $rootScope, $sce, $location, $anchorScroll, OcatToMongoDb, OcatToDrupal, $timeout, $stateParams, configData, ValidationCourseInfo, GetContentsFromDb) {
    $scope.showHints = true;
    $scope.showTabDialog = function(ev, type, idx, parent) {
        var cid = encodeURIComponent(window.localStorage.getItem('cid'));
        if(type == 'media' || type == 'media_operator'){
            if(type == 'media_operator'){
                var mediaTemp = '/views/templates/dialog/mediaAdminDialog.html';
            }else if(type == 'media'){
                var mediaTemp = '/views/templates/dialog/mediaDialog.html';
            }
            $mdDialog.show({
                controller: cwController,
                templateUrl: mediaTemp,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
            $timeout(function(){
                $scope.returnURL = baseUrl + "/api/getxinicscontents?" + cid;
                var username = window.sessionStorage.getItem('username');
                // if(username == 'admin') {
                //     username = 'adminmaster';
                // }
                $scope.siteAuthKey = commonsSiteAuthKey;
                // $scope.accessURL = commonsAccessURI;
                if(type == 'media_operator'){
                    $scope.accessURL = commonsAccessURI + '?module=xn_commonsi_manager&act=dispXn_commonsi_managerSingleContentImporter';
                    var x = document.createElement("FORM");
                    x.setAttribute("id", "myMediaForm");
                    x.setAttribute("action", $scope.accessURL);
                    x.setAttribute("method", "POST");
                    x.setAttribute("target", "myFrames");
                    document.getElementById('my_content_frame').appendChild(x);
                    var a = document.createElement("INPUT");
                    a.setAttribute("type", "hidden");
                    a.setAttribute("name", "site_auth_key");
                    a.setAttribute("value", $scope.siteAuthKey);
                    document.getElementById("myMediaForm").appendChild(a);
                    var f = document.createElement("INPUT");
                    f.setAttribute("type", "hidden");
                    f.setAttribute("name", "return_uri");
                    f.setAttribute("value", $scope.returnURL);
                    document.getElementById("myMediaForm").appendChild(f);
                }else if(type == 'media'){
                    $scope.accessURL = commonsAccessURI + '?module=xn_sso2013&act=procXn_sso2013Login';
                    if(username == 'admin') {
                        username = 'adminmaster';
                    }
                    var x = document.createElement("FORM");
                    x.setAttribute("id", "myMediaForm");
                    x.setAttribute("action", $scope.accessURL);
                    x.setAttribute("method", "POST");
                    x.setAttribute("target", "myFrames");
                    document.getElementById('my_content_frame').appendChild(x);
                    var a = document.createElement("INPUT");
                    a.setAttribute("type", "hidden");
                    a.setAttribute("name", "SiteAuthKey");
                    a.setAttribute("value", $scope.siteAuthKey);
                    document.getElementById("myMediaForm").appendChild(a);
                    var b = document.createElement("INPUT");
                    b.setAttribute("type", "hidden");
                    b.setAttribute("name", "UserID");
                    b.setAttribute("value", username);
                    document.getElementById("myMediaForm").appendChild(b);
                    var c = document.createElement("INPUT");
                    c.setAttribute("type", "hidden");
                    c.setAttribute("name", "UserName");
                    c.setAttribute("value", username);
                    document.getElementById("myMediaForm").appendChild(c);
                    var d = document.createElement("INPUT");
                    d.setAttribute("type", "hidden");
                    d.setAttribute("name", "UserType");
                    d.setAttribute("value", "6");
                    document.getElementById("myMediaForm").appendChild(d);
                    var e = document.createElement("INPUT");
                    e.setAttribute("type", "hidden");
                    e.setAttribute("name", "Action");
                    e.setAttribute("value", "embed");
                    document.getElementById("myMediaForm").appendChild(e);
                    var f = document.createElement("INPUT");
                    f.setAttribute("type", "hidden");
                    f.setAttribute("name", "ReturnURL");
                    f.setAttribute("value", $scope.returnURL);
                    document.getElementById("myMediaForm").appendChild(f);
                }
                var mediaForm = document.getElementById('myMediaForm');
                mediaForm.submit();
                var mediaFrame = document.getElementById('myMediaFrame');
                // chrome 71 version hotfix
                //if(!!window.chrome && !!window.chrome.webstore || /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)){
                if(!!window.chrome || /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)){
                    mediaFrame.onload = function(){
                        iframePass();
                    };
                }else if(/*@cc_on!@*/false || !!document.documentMode || !isIE && !!window.StyleMedia){
                    mediaFrame.attachEvent('onload', function(){iframePass();});
                }else{
                    mediaFrame.addEventListener('onload', function(){iframePass();}, false);
                }

                function iframePass(){
                    var mediaFrame = document.getElementById('myMediaFrame');
                    if(mediaFrame.contentWindow.location.host == location.hostname){
                        $scope.getContentsFromXinics();
                    }
                }
            },500);
        }
        else if(type == 'lti'){
            $mdDialog.show({
                controller: cwController,
                templateUrl: '/views/templates/dialog/ltiDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
        }
        else if(idx == 99){
            $mdDialog.show({
                controller: cwController,
                templateUrl: '/views/templates/dialog/revisionDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
        }
        else if(idx == 100){
            $mdDialog.show({
                controller: cwController,
                templateUrl: '/views/templates/dialog/deleteRevisionAllDataDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
        }
    };
}
