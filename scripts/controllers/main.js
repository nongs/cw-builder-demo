'use strict';

//코스웨어 전체 데이터 저장 및 변경 함수
var cwController = function($scope, $http, $q, Upload, $mdDialog, $mdMedia, $rootScope, $sce, $location, $anchorScroll, OcatToMongoDb, OcatToDrupal, $timeout, $stateParams, configData, ValidationCourseInfo, GetContentsFromDb){
	angular.module('ocatApp').commonsController($scope, $http, $q, Upload, $mdDialog, $mdMedia, $rootScope, $sce, $location, $anchorScroll, OcatToMongoDb, OcatToDrupal, $timeout, $stateParams, configData, ValidationCourseInfo, GetContentsFromDb);

	$scope.hostinfo = configData;
	$scope.uploader = {};
	$scope.loading = 1;
	$scope.exportProgress = 0;
	$scope.langcode = 'und';

	var roles = window.localStorage.userrole == 'admin' ? true : false;
	$scope.fileUploadTemp = function(flow, dr) {
		if(flow.files[0] != null) {
			flow.files[0].file.upload = Upload.upload({
				url:'/api/editor/fileupload',
				data: { file: flow.files[0].file },
			});
			flow.files[0].file.upload.then(function(response) {
				dr.files = [{url: '/upload/' + response.data.filename, filename: response.data.originalname}];
				$mdDialog.show({
					controller: cwController,
					templateUrl: '/views/templates/dialog/complateFileUpload.html',
					parent: angular.element(document.body),
					clickOutsideToClose:true
				})
				.then(function(answer) {
					$scope.status = 'You said the information was "' + answer + '".';
				}, function() {
					$scope.status = 'You cancelled the dialog.';
				});
				$scope.toDbPutData('파일 추가');
			});
		}
	}

	$scope.imageUploadTemp = function(flow, dr) {
		if(flow.files[0] != null) {
			flow.files[0].file.upload = Upload.upload({
				url:'/api/editor/fileupload',
				data: { file: flow.files[0].file },
			});
			flow.files[0].file.upload.then(function(response) {
				dr.images = [{url: '/upload/' + response.data.filename, filename: response.data.originalname}];
				$mdDialog.show({
					controller: cwController,
					templateUrl: '/views/templates/dialog/complateFileUpload.html',
					parent: angular.element(document.body),
					clickOutsideToClose:true
				})
				.then(function(answer) {
					$scope.status = 'You said the information was "' + answer + '".';
				}, function() {
					$scope.status = 'You cancelled the dialog.';
				});
				$scope.toDbPutData('이미지 추가');
			}, function(){
			});
		}
	}

	$scope.fileUploadCancleTemp = function(dr) {
		dr.files = null;
		$scope.toDbPutData('파일 삭제');
	}

	$scope.imageUploadCancleTemp = function(dr) {
		dr.images = null;
		$scope.toDbPutData('이미지 삭제');
	}

	$scope.fileUpload = function(dr) {
		var fileReader = new FileReader();
		if($scope.uploader.flow.files[0] != null) {
			fileReader.readAsDataURL($scope.uploader.flow.files[0].file);
			fileReader.onload = function(event) {
				dr.images = [{file:{result:event.target.result}}];
				$scope.toDbPutData('이미지 추가');
			};
		}
	}

	$scope.fileUploadCancle = function(dr) {
		dr.images.shift();
		$scope.toDbPutData('이미지 삭제');
	}

	$scope.uploadPic = function(file, field_name, win) {
		file.upload = Upload.upload({
			url:'/api/editor/fileupload',
			data: { file: file },
		});

		file.upload.then(function (response) {
			$timeout(function () {
				file.result = response.data;
				var filepath = 'upload/' + response.data.filename;
				win.document.getElementById(field_name).value = filepath;
			});
		}, function (response) {
			console.log('success response = ' + response);
			if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
		}, function (evt) {
			// Math.min is to fix IE which reports 200% sometimes
			file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		});
	}

	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				$('#blah').attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	$scope.tinymceOptions = {
		onChange: function(e) {
			console.log('Changed');
		},
		plugins: 'advlist autolink link image media lists charmap print preview leaui_formula paste',
		skin: 'lightgray',
		theme : 'modern',
		subfolder:"",
		menu: {
			format: { title: 'Format', items: 'italic underline strikethrough superscript subscript | formats | removeformat' },
		},
		paste_data_images: true,
		toolbar1: 'undo redo | headings bold italic underline strikethrough superscript subscript code | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image leaui_formula',
		// toolbar2: 'print preview media  | link image | uploadimage',
		automatic_uploads: true,
		images_dataimg_filter: function(img) {
			return img.hasAttribute('internal-blob');
		},
		// images_upload_base_path: '/home/obenef/ocat/',
		// images_upload_url: '/home/obenef/ocat/app/postAcceptor.php',
		file_browser_callback_types: 'file image media',
		file_browser_callback: function(field_name, url, type, win) {
			if(type=='image') {
				angular.element('#file_uploads input').click();
				angular.element('#file_uploads input').change(function() {
					// console.log('$scope.picFile = ' + this.files[0]);
					$scope.uploadPic(this.files[0], field_name, win);
				});
			}
		}
	};

	$scope.courseID = '';
	$scope.selectedUol = 0;
	$scope.selectedLo = 0;
	$scope.selectedDrg = 0;
	$scope.selectedDr = 0;
	// $scope.drType = ['media', 'quiz', 'discussion', 'text', 'image', 'file', 'homework', 'lti', 'bank'];
	// $scope.drTypeKo = ['미디어', '퀴즈', '토론', '텍스트', '이미지', '파일', '과제', 'LTI', '문제은행'];
	$scope.drTypeKo = ['퀴즈', '토론', '텍스트', '이미지', '파일', '과제', 'LTI', '문제은행'];
	if(roles){
		// $scope.drType = [{type:'media', ko:'미디어'}, {type:'media_operator', ko:'다른 사용자 미디어'}, {type:'quiz', ko:'퀴즈'}, {type:'discussion', ko:'토론'}, {type:'text', ko:'텍스트'}, {type:'image', ko:'이미지'}, {type:'file', ko:'파일'}, {type:'homework', ko:'과제'}];
		$scope.drType = [{type:'quiz', ko:'퀴즈'}, {type:'discussion', ko:'토론'}, {type:'text', ko:'텍스트'}, {type:'image', ko:'이미지'}, {type:'file', ko:'파일'}, {type:'homework', ko:'과제'}];
	}else{
		// $scope.drType = [{type:'media', ko:'미디어'}, {type:'quiz', ko:'퀴즈'}, {type:'discussion', ko:'토론'}, {type:'text', ko:'텍스트'}, {type:'image', ko:'이미지'}, {type:'file', ko:'파일'}, {type:'homework', ko:'과제'}];
		$scope.drType = [{type:'quiz', ko:'퀴즈'}, {type:'discussion', ko:'토론'}, {type:'text', ko:'텍스트'}, {type:'image', ko:'이미지'}, {type:'file', ko:'파일'}, {type:'homework', ko:'과제'}];
	}
	$scope.drType_ex = $scope.drType.slice(0,-1);
	$scope.drTypeKo_ex = $scope.drTypeKo.slice(0,-1);
	$scope.drQuizTabList = ['single_choice', 'multi_choice', 'dropdown', 'description', 'short_answer', 'true_false'];
	$scope.drQuizTabListKo = ['객관식', '체크박스', '드롭다운', '서술형', '단답형', 'OX 퀴즈'];
	$scope.surveyType = ['single_choice', 'description', 'short_answer'];
	$scope.surveyTypeKo = ['객관식', '서술형', '단답형'];
	$scope.mediaUrl = '';
	$scope.dataDates = [];
	$scope.ltiObject = {};

	$scope.pollTypeList = ['single_choice', 'short_answer', 'description'];
	$scope.pollTypeKo = ['객관식', '단답형', '서술형'];
	$scope.cwNid = '0';
	$scope.hostname = '';
	$scope.domain = '';
	var $splitValue = [];
	if($stateParams.cid != null) {
		$scope.courseID = $stateParams.cid;
		$splitValue = $stateParams.cid.split(':');
		$scope.cwNid = $splitValue[2];
		OcatToMongoDb.getHostName().then(function(response) {
			$scope.hostname = response;
		});
		OcatToMongoDb.getDomainName().then(function(response) {
			$scope.domain = response;
		});
	}
	OcatToMongoDb.getAllData({nid:$scope.cwNid}).then(function(response) {
		if(!response[0]) {
			$scope.loading = 0;
			getDefaultData();
		}
		else {
			if(response[0].data != null) {
				$scope.cwList = JSON.parse(response[0].data);
				if(typeof $scope.cwList == 'string'){
					$scope.cwList = forStringParse($scope.cwList);
				}
				$scope.cwList.title = window.localStorage.getItem('Title');
				for(var _uol_ in $scope.cwList.uol) {
					if($scope.cwList.uol[_uol_].startDate) {
						$scope.cwList.uol[_uol_].startDate = $scope.strToDate($scope.cwList.uol[_uol_].startDate, 'st');
					}
					if($scope.cwList.uol[_uol_].endDate) {
						$scope.cwList.uol[_uol_].endDate = $scope.strToDate($scope.cwList.uol[_uol_].endDate, 'end');
					}
					$scope.cwList.uol[_uol_].closed = false;
					$scope.cwList.uol[_uol_].active = false;
					$scope.cwList.uol[_uol_].selected = false;
					for(var _lo_ in $scope.cwList.uol[_uol_].lo) {
						$scope.cwList.uol[_uol_].lo[_lo_].closed = false;
						$scope.cwList.uol[_uol_].lo[_lo_].active = false;
						$scope.cwList.uol[_uol_].lo[_lo_].selected = false;
						for(var _drg_ in $scope.cwList.uol[_uol_].lo[_lo_].drg) {
							$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].closed = false;
							$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].active = false;
							$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].selected = false;
							for(var _dr_ in $scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr) {
								$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].closed = false;
								$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].active = false;
								$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].selected = false;
								if($scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild != null) {
									if($scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild.options != null) {
										for(var _options_ in $scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild.options) {
											$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild.options[_options_].closed = false;
											$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild.options[_options_].active = false;
											$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].dr[_dr_].drChild.options[_options_].selected = false;
										}
									}
								}
							}
						}
					}
				}
				$scope.cwListUolLength = $scope.cwList.uol.length * 65 + 15;
				setScrollbar($scope.cwListUolLength);
				$scope.tabScrollMove = function(dir){
					var wrapper = document.getElementById("uol_menu_wrap");
					if (dir == '0'){
						if(wrapper.scrollWidth <= wrapper.offsetWidth){
						}else if(wrapper.scrollLeft < wrapper.offsetWidth/3){
							wrapper.scrollLeft = 0;
						}else{
							wrapper.scrollLeft -= wrapper.offsetWidth / 3;
						}
					}else if(dir == '1'){
						if(wrapper.scrollWidth <= wrapper.offsetWidth){
						}else if(wrapper.scrollLeft + wrapper.offsetWidth/3 > wrapper.scrollWidth){
							wrapper.scrollLeft = wrapper.scrollWidth - wrapper.offsetWidth;
						}else{
							wrapper.scrollLeft += wrapper.offsetWidth / 3;
						}
					}
				}
			}
		}
		$scope.dataDates = response;
		for(var res in response) {
			var temp = response[res].time.split(' ');
			for(var tmp in temp) {
				if(tmp > 3) {
					if(tmp == temp.length - 1) {
						temp[4] = temp[tmp];
					}
					else {
						temp[3] += ' ' + temp[tmp];
					}
				}
			}
			if(res == 0) {
				if(temp[4] == null) {
					$scope.revisions = [{day: temp[0], time: temp[1], type: temp[2], title: temp[4], action: temp[3], full: response[res].time}];
				}
				else {
					$scope.revisions = [{day: temp[0], time: temp[1], type: temp[2], title: temp[3], action: temp[4], full: response[res].time}];
				}
			}
			else {
				if(temp[4] == null) {
					$scope.revisions.push({day: temp[0], time: temp[1], type: temp[2], title: temp[4], action: temp[3], full: response[res].time});
				}
				else {
					$scope.revisions.push({day: temp[0], time: temp[1], type: temp[2], title: temp[3], action: temp[4], full: response[res].time});
				}
			}
		}
	}).then(function() {
		$scope.loading = 0;
	});

	// 코스 저장 //
	$scope.complete_cw = false;
	$scope.complete_uol = false;
	$scope.complete_lo = false;
	$scope.complete_drg = false;
	$scope.complete_dr = false;
	$scope.chk_complete = true;
	$scope.cancel_save = function() {
		$scope.cancel();
	}

	$scope.goto_lms = function() {
		window.sessionStorage.removeItem('session_name');
		window.sessionStorage.removeItem('sessid');
		window.sessionStorage.removeItem('drupaltoken');
		window.sessionStorage.removeItem('yourTokenKey');
		window.sessionStorage.removeItem('user_name');
		window.localStorage.removeItem('validationSuccess');
		window.localStorage.removeItem('Title');
		location.href="http://" + $scope.domain + "/ko/courseware/" + $scope.cwList.nid;
	}

	$scope.goto_courseware = function() {
		window.sessionStorage.removeItem('session_name');
		window.sessionStorage.removeItem('sessid');
		window.sessionStorage.removeItem('drupaltoken');
		window.sessionStorage.removeItem('yourTokenKey');
		window.sessionStorage.removeItem('user_name');
		window.localStorage.removeItem('validationSuccess');
		window.localStorage.removeItem('Title');
		location.href="http://" + $scope.domain + "/ko/courseware/" + $scope.cwList.nid;
	}

	$scope.save_complete = function() {
		$timeout(function() {
			$scope.migrationToDrupal();
		}, 10);
	};

	// Lock Page //
	$scope.lockPage = true;
	$scope.hello = true;

	// jQuery : body scroll 이벤트리스너 //
	angular.element(window).scroll(function() {
		var scrollPosition = angular.element(document).scrollTop() + 40;
		angular.element('#add_dr_list').stop().animate( { top : scrollPosition }, 300 );
	});

	angular.element('.start_number').find('.select_box').click(function() {
		angular.element('.start_number').find('.select_box').addClass('active');
	});
	angular.element('.start_number').find('.select_box').blur(function() {
		angular.element('.start_number').find('.select_box').removeClass('active');
	});

	angular.element('.end_number').find('.select_box').click(function() {
		angular.element('.end_number').find('.select_box').addClass('active');
	});
	angular.element('.end_number').find('.select_box').blur(function() {
		angular.element('.end_number').find('.select_box').removeClass('active');
	});

	//================ Toggle header bottom을 구현한다. ================//
	$scope.active_headerBottom = true;
	$scope.toggle_headerBottom = function() {
		if($scope.active_headerBottom) {
			$scope.active_headerBottom = false;
		}
		else {
			$scope.active_headerBottom = true;
		}

		reset_left_height();
	}

	$scope.activeMenuTab1 = false;
	$scope.activeMenuTab2 = false;
	$scope.uolActive = 0;
	$scope.toggle_activeMenuTab = function(uol) {
		if(uol > -1){
			$scope.activeMenuTab1 = false;
			$scope.activeMenuTab2 = false;
			$scope.uolActive = uol;
		}else if(uol < -1) {
			$scope.activeMenuTab1 = false;
			$scope.activeMenuTab2 = true;
			if($scope.cwList.survey == null) {
				$scope.cwList.survey = {
					id:randomString(32),
					type:'survey',
					nid:'',
					allowedTypes:['dr'],
					dr:
					[{
						id:randomString(32),
						nid:'',
						type:'dr',
						drType:'none',
						title:'',
						body: '',
						allowedTypes:['drChild'],
						drChild:{}
					}]
				};
			}
			$scope.uolActive = -1;
		}
		else {
			$scope.activeMenuTab1 = true;
			$scope.activeMenuTab2 = false;
			$scope.uolActive = -1;
		}
		if($scope.uolActive != $scope.selectedUol){
			$scope.selectedUol = -1;
		}
		$scope.selectedDr = null;
		$scope.isEditDate = false;
	}

	//================ LeftSideBar의 높이를 Browser의 높이와 일치시킨다 ================//

	$scope.toggleLockPage = function() {
		if($scope.lockPage) {
			$scope.lockPage = false;
		} else {
			$scope.lockPage = true;
		}
	};

	//================ UOL, LO, DRG 제어 ================//

	// 브라우저 높이를 구한 후 left_sideBar에 적용한다. //
	$scope.left_height = 0;
	angular.element(window).resize(function() {
		reset_left_height();
	}).scroll(function() {
		var scroll_top = angular.element(window).scrollTop();
		var header_height = angular.element('#header_container').height();

		if(scroll_top >= 60) {
			angular.element('#left_sidebar').addClass('fixed');
		}
		else {
			angular.element('#left_sidebar').removeClass('fixed');
		}
	}).resize();

	function reset_left_height() {
		var win_height = angular.element(window).height();
		var header_height = angular.element('#header_container').height();

		if($scope.active_headerBottom) {
			header_height += 72;
		} else {
			header_height -= 72;
		}
		$scope.left_height = win_height - header_height;
	}

	var gutter = 10;
	$scope.selected_element = null;

	$scope.active_form = function(index, event) {
		var classes = event.currentTarget.className;
		var class_array = classes.split(' ');
		var index_array = class_array[0].split('_');

		angular.element('form').removeClass('active');
		event.currentTarget.className = 'ng-pristine ng-valid active';
	}

	// 선택한 uol form을 활성화 한다. //
	$scope.active_form_uol = function(index, event, uol) {
		$scope.all_selected_false();
		$scope.set_selected_element(uol);
		$scope.disable_left_sideBar();
		uol.active = true;
	}

	// 선택한 lo form을 활성화 한다. //
	$scope.active_form_lo = function(index, event, uol, lo) {
		$scope.all_selected_false();
		$scope.set_selected_element(lo);
		$scope.disable_left_sideBar();

		uol.active = true;
		lo.active = true;
		$scope.loActive = index;
	};

	// 선택한 drg form을 활성화 한다. //
	$scope.active_form_drg = function(index, event, uol, lo, drg) {
		$scope.all_selected_false();
		$scope.set_selected_element(drg);
		drg.selected = true;
		$scope.disable_left_sideBar();

		uol.active = true;
		lo.active = true;
		drg.active = true;

		// 최상단으로 스크롤한다 //
		$location.hash('top');
		$anchorScroll();
		$rootScope.$broadcast('refreshMarkup');
	};

	$scope.set_selected_element = function(element) {
		if($scope.selected_element != null) {
			$scope.selected_element.selected = false;
		}
		element.selected = true;
		$scope.selected_element = element;
	}

	$scope.all_selected_false = function() {
		for(var _uol_ in $scope.cwList.uol) {
			$scope.cwList.uol[_uol_].closed = false;
			$scope.cwList.uol[_uol_].active = false;
			$scope.cwList.uol[_uol_].selected = false;
			for(var _lo_ in $scope.cwList.uol[_uol_].lo) {
				$scope.cwList.uol[_uol_].lo[_lo_].closed = false;
				$scope.cwList.uol[_uol_].lo[_lo_].active = false;
				$scope.cwList.uol[_uol_].lo[_lo_].selected = false;
				for(var _drg_ in $scope.cwList.uol[_uol_].lo[_lo_].drg) {
					$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].closed = false;
					$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].active = false;
					$scope.cwList.uol[_uol_].lo[_lo_].drg[_drg_].selected = false;
				}
			}
		}
	}

	// 선택된 요소를 찾는다. 발견되면 $scope.selected_element 에 저장한다. //
	$scope.find_selected_element = function() {
		for(var key_uol in $scope.cwList.uol) {
			if($scope.cwList['uol'][key_uol].selected) {
				$scope.selected_element = $scope.cwList['uol'][key_uol];
				break;
			}
			else {
				for(var key_lo in $scope.cwList.uol[key_uol].lo) {
					if($scope.cwList['uol'][key_uol].lo[key_lo].selected) {
						$scope.selected_element = $scope.cwList['uol'][key_uol].lo[key_lo];
						break;
					}
					else {
						for(var key_drg in $scope.cwList.uol[key_uol].lo[key_lo].drg) {
							if($scope.cwList.uol[key_uol].lo[key_lo].drg[key_drg].selected) {
								$scope.selected_element = $scope.cwList.uol[key_uol].lo[key_lo].drg[key_drg];
								break;
							}
						}
					}

				}
			}
		}
	};

	// Disabled //
	$scope.disable_left_sideBar = function() {
		for(var key_uol in $scope.cwList.uol) {
			$scope.cwList['uol'][key_uol].active = false;

			for(var key_lo in $scope.cwList.uol[key_uol].lo) {
				$scope.cwList.uol[key_uol].lo[key_lo].active = false;

				for(var key_drg in $scope.cwList.uol[key_uol].lo[key_lo].drg) {
					$scope.cwList.uol[key_uol].lo[key_lo].drg[key_drg].active = false;
				}
			}
		}
	};

	$scope.lo_disable = function() {
		for(var key in $scope.cwList['uol']) {
			$scope.cwList['uol'][key].active = false;
		}
	};

	$scope.drg_disable = function() {
		for(var key in $scope.cwList['uol']) {
			$scope.cwList['uol'][key].active = false;
		}
	};


	$scope.toggle_form = function(index, event) {
		//event.currentTarget.className = 'ng-pristine ng-valid active';
		var classes = event.currentTarget.className;

		// console.log('index = ' + index);
		// console.log('classes = ' + classes);

		var class_array = classes.split(' ');
		var index_array = class_array[1].split('_');
		var toggle_depth = index_array[0];
		var toggle_index = index_array[1];

		if(toggle_depth == 'lo') {
			var parent_classes = angular.element(event.target).parent('.lo_list').attr('class');
			// console.log('parent_classes = ' + parent_classes);
		}

		// 선택한 화살표 버튼에 해당하는 form의  //
		var close_form_height = 38;

		if(classes.indexOf('closed') == -1) {
			var close_class = classes + ' closed';
			event.currentTarget.className = close_class;

			if(toggle_depth == 'uol') {
				angular.element('.uol_' + index).addClass('closed');

				var close_height = close_form_height + gutter;
				angular.element('div.uol_' + index).css('height', close_height);
			}
			else if(toggle_depth == 'lo') {
				angular.element('.lo_' + index).addClass('closed');
				var close_height = close_form_height + gutter;
				angular.element('li.lo_' + index).css('height', close_height);
			}
		}
		else {
			var open_class = classes.replace(' closed', '');
			event.currentTarget.className = open_class;

			if(toggle_depth == 'uol') {
				angular.element('.uol_' + index).removeClass('closed');


				var form_height = angular.element('.uol_' + index).find('.form_container_uol').children('form').outerHeight();
				var container_height = angular.element('.uol_' + index).find('.lo_container').outerHeight();

				angular.element('div.uol_' + index).removeAttr('style');
			}
			else if(toggle_depth == 'lo') {
				angular.element('.lo_' + index).removeClass('closed');

				var form_height = angular.element('.lo_' + index).find('.form_container_lo').children('form').outerHeight();
				var container_height = angular.element('.lo_' + index).find('.drg_container').outerHeight();

				angular.element('li.lo_' + index).removeAttr('style');
			}
		}
	}
	$scope.toggle_form_uol = function(index, event, uol) {
		if(uol.closed == false) {
			uol.closed = true;
		}
		else {
			uol.closed = false;
		}
	};

	$scope.toggle_form_lo = function(index, event, lo) {
		if(lo.closed == false) {
			lo.closed = true;
		}
		else {
			lo.closed = false;
		}
	};

	$scope.toggle_form_drg = function(index, event, drg) {
		if(drg.closed == false) {
			drg.closed = true;
		}
		else {
			drg.closed = false;
		}
	};

	/** remove active function **/
	function removeActive(){
		angular.element('.uol').removeClass('active');
		angular.element('.lo').removeClass('active');
		angular.element('.drg').removeClass('active');
		angular.element('.dr').removeClass('active');
	};

	// Click UOL //
	$scope.selectedUolFunc = function(index){
		$scope.selectedUol = index;
		$scope.selectedLo = 0;
		$scope.selectedDrg = 0;

		angular.element('.uol').find('.input_uol_title').attr('readonly', true);
		angular.element('.uol.selected').find('input').attr('readonly', false);
	};
	// Click LO //
	$scope.selectedLoFunc = function(pindex, index){
		$scope.selectedUol = pindex;
		$scope.selectedLo = index;
		$scope.selectedDrg = 0;
		$scope.selectedDr = null;

		angular.element('.lo').find('.input_lo_title').attr('readonly', true);
		angular.element('.lo.selected').find('input').attr('readonly', false);
	};

	// Click DRG //
	$scope.selectedDrgWriteFunc = function(ppindex, pindex, index){
		$scope.selectedUol = ppindex;
		$scope.selectedLo = pindex;
		$scope.selectedDrg = index;
		$scope.selectedDr = null;

		$scope.uolActive = ppindex;
		$scope.loActive = pindex;
		$scope.drgActive = index;

		angular.element('.drg').find('.input_drg_title').attr('readonly', true);
		angular.element('.drg.selected').find('input').attr('readonly', false);
	}


	$scope.selectedDrgFunc = function(index) {
		$scope.selectedDrg = index;
	};

	$scope.selectedDrFunc = function(indexs, index){
		$scope.selectedDr = index;
	};

	$scope.selectedQuizFunc = function(index, dr){
		if(dr.selectedQuizTab === true) {
			dr.selectedQuizTab = false;
			dr.drChild.drChildTypeIndex = index;
			dr.drChild.allowedTypes = [$scope.drQuizTabList[index]];
			var no = 0;
			for(var option in dr.drChild.options) {
				dr.drChild.options[no].type = $scope.drQuizTabList[index];
				no++;
			}
		}
		else {
			dr.selectedQuizTab = true;
		}
	};
	$scope.quizTabBlurFunc = function(dr){
		dr.selectedQuizTab = false;
	};

	var title = '';
	var nid = '';

	var validationkey = window.localStorage.getItem('Title');
	if(validationkey != null) {
		title = validationkey;
	}
	else {
		title = 'Courseware Demo';
	}

	if($stateParams.cid != null) {
		$splitValue = $stateParams.cid.split(':');
		nid = $splitValue[2];
	}
	else {
		nid = '';
	}

	function getDefaultData(){
		//코스웨어 전체 데이터 템플릿
		$scope.cwList =
		{
			id:randomString(32),
			type:'cw',
			allowedTypes:['uol'],
			title:title,
			nid:nid,
			uol:
			[{
				id:randomString(32),
				type:'uol',
				closed:false,
				active:false,
				selected:false,
				allowedTypes:['lo'],
				title:'내용을 입력하세요',
				startDate:0,
				endDate:0,
				configDate:false,
				publish:true,
				lo:
				[{
					id:randomString(32),
					type:'lo',
					closed:false,
					active:false,
					selected:false,
					title:'내용을 입력하세요',
					allowedTypes:['drg'],
					drg:
					[{
						id:randomString(32),
						type:'drg',
						closed:false,
						active:false,
						selected:false,
						title:'내용을 입력하세요',
						allowedTypes:['dr'],
						dr:
						[{
							id:randomString(32),
							nid:'',
							type:'dr',
							drType:'none',
							title:'',
							allowedTypes:['drChild'],
							drChild:{}
						}]
					}]
				}]
			}],
			survey:
			{
				id:randomString(32),
				type:'survey',
				nid:'',
				allowedTypes:['dr'],
				dr:
				[{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'none',
					title:'',
					body: '',
					allowedTypes:['drChild'],
					drChild:{}
				}]
			}
		};
	}

	// 주차의 공개여부 설정
	$scope.settingThisExpose = function(uol){
		uol.publish ? uol.publish = false : uol.publish = true;
	}

	//주제를 추가했을 시 동작
	$scope.addUol = function(){
		$scope.cwList.uol.push(
		{
			id:randomString(32),
			type:'uol',
			closed:false,
			active:false,
			selected:false,
			allowedTypes:['lo'],
			title:'내용을 입력하세요',
			startDate:0,
			endDate:0,
			configDate:false,
			publish:true,
			lo:
			[{
				id:randomString(32),
				type:'lo',
				closed:false,
				active:false,
				selected:false,
				allowedTypes:['drg'],
				title:'내용을 입력하세요',
				drg:
				[{
					id:randomString(32),
					type:'drg',
					closed:false,
					active:false,
					selected:false,
					allowedTypes:['dr'],
					title:'내용을 입력하세요',
					dr:
					[{
						id:randomString(32),
						nid:'',
						type:'dr',
						drType:'none',
						title:'',
						allowedTypes:['drChild'],
						drChild:{}
					}]
				}]
			}]
		});
		$scope.toDbPutData('주제 추가');
		$scope.cwListUolLength = $scope.cwList.uol.length * 65 + 15;
		setScrollbar($scope.cwListUolLength);
	};

	//주제를 복제했을 시 동작
	$scope.copyUol = function(source) {
		var uol = $scope.cwList.uol;
		var copy = angular.copy(source);
		copy.id = randomString(32);
		copy.closed = false;
		copy.active = false;
		copy.selected = false;
		// uol.push(copy);
		for(var copyChild1 in copy) {
			if(copyChild1 === 'lo') {
				for(var a = 0; a < copy.lo.length; a++) {
					copy.lo[a].id = randomString(32);
					copy.lo[a].closed = false;
					copy.lo[a].active = false;
					copy.lo[a].selected = false;
					if(copy.lo[a].drg != null) {
						for(var b = 0; b < copy.lo[a].drg.length; b++) {
							copy.lo[a].drg[b].id = randomString(32);
							copy.lo[a].drg[b].closed = false;
							copy.lo[a].drg[b].active = false;
							copy.lo[a].drg[b].selected = false;
							if(copy.lo[a].drg[b].dr != null) {
								for(var c = 0; c < copy.lo[a].drg[b].dr.length; c++) {
									copy.lo[a].drg[b].dr[c].nid = '';
									copy.lo[a].drg[b].dr[c].id = randomString(32);
									if(copy.lo[a].drg[b].dr[c].drChild != null) {
										for(var d = 0; d < copy.lo[a].drg[b].dr[c].drChild.length; d++) {
											copy.lo[a].drg[b].dr[c].drChild[d].id = randomString(32);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		uol.push(copy);
		$scope.toDbPutData('주제 ' + source.title + ' 복제');
		$scope.cwListUolLength = $scope.cwList.uol.length * 65 + 15;
		setScrollbar($scope.cwListUolLength);
	};

	//주제를 삭제했을 시 동작
	$scope.deleteUol = function(index) {
		if($scope.cwList.uol.length === 1) {
			return;
		}
		else if (confirm('정말로 삭제하시겠습니까?') == true) {
			var title = $scope.cwList.uol[index].title;
			$scope.cwList.uol.splice(index, 1);
			$scope.toDbPutData('주제 ' + title + ' 삭제');
			$scope.cwListUolLength = $scope.cwList.uol.length * 65 + 15;
			setScrollbar($scope.cwListUolLength);
		}
	};

	//소주제를 추가했을 시 동작
	$scope.addLo = function(parentUolIndex){
		$scope.cwList.uol[parentUolIndex].lo.push(
		{
			id:randomString(32),
			type:'lo',
			closed:false,
			active:false,
			selected:false,
			allowedTypes:['drg'],
			title:'내용을 입력하세요',
			drg:
			[{
				id:randomString(32),
				type:'drg',
				closed:false,
				active:false,
				selected:false,
				allowedTypes:['dr'],
				title:'내용을 입력하세요',
				dr:
				[{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'none',
					title:'내용을 입력하세요',
					allowedTypes:['drChild'],
					drChild:{}
				}]
			}]
		});
		$scope.toDbPutData('소주제 추가');
	};

	$scope.copyLo = function(source) {
		var lo = $scope.cwList.uol[$scope.selectedUol].lo;
		var copy = angular.copy(source);
		copy.id = randomString(32);
		copy.closed = false;
		copy.active = false;
		copy.selected = false;
		// uol.push(copy);
		for(var copyChild1 in copy) {
			if(copy.drg != null) {
				for(var b = 0; b < copy.drg.length; b++) {
					copy.drg[b].id = randomString(32);
					copy.drg[b].closed = false;
					copy.drg[b].active = false;
					copy.drg[b].selected = false;
					if(copy.drg[b].dr != null) {
						for(var c = 0; c < copy.drg[b].dr.length; c++) {
							copy.drg[b].dr[c].nid = '';
							copy.drg[b].dr[c].id = randomString(32);
							if(copy.drg[b].dr[c].drChild != null) {
								for(var d = 0; d < copy.drg[b].dr[c].drChild.length; d++) {
									copy.drg[b].dr[c].drChild[d].id = randomString(32);
								}
							}
						}
					}
				}
			}
		}
		lo.push(copy);
		$scope.toDbPutData('소주제 ' + source.title + ' 복제');
	};

	$scope.deleteLo = function(index) {
		if($scope.cwList.uol[$scope.selectedUol].lo.length === 1) {
			return;
		}
		else {
			var title = $scope.cwList.uol[$scope.selectedUol].lo.title;
			$scope.cwList.uol[$scope.selectedUol].lo.splice(index, 1);
			$scope.toDbPutData('소주제 ' + title + ' 삭제');
		}
	};

	//DRG를 추가했을 시 동작
	$scope.loActive = -1;
	$scope.addDrg = function(){
		if (!$scope.disable && $scope.loActive != -1 && $scope.cwList.uol[$scope.uolActive].lo.length >= $scope.loActive + 1 && $scope.cwList.uol[$scope.uolActive].lo[$scope.loActive].active) {
			$scope.cwList.uol[$scope.uolActive].lo[$scope.loActive].drg.push(
			{
				id:randomString(32),
				type:'drg',
				closed:false,
				active:false,
				selected:false,
				title:'내용을 입력하세요',
				dr:
				[{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'none',
					title:'내용을 입력하세요',
					allowedTypes:['drChild'],
					drChild:{}
				}]
			});
			$scope.toDbPutData('페이지 추가');
		} else if(!$scope.disable) {
			$scope.cwList.uol[$scope.uolActive].lo[$scope.cwList.uol[$scope.uolActive].lo.length - 1].drg.push(
			{
				id:randomString(32),
				type:'drg',
				closed:false,
				active:false,
				selected:false,
				title:'내용을 입력하세요',
				dr:
				[{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'none',
					title:'내용을 입력하세요',
					allowedTypes:['drChild'],
					drChild:{}
				}]
			});
			$scope.toDbPutData('페이지 추가');
		}
	};

	//DRG를 복제했을 시 동작
	$scope.copyDrg = function(source) {
		var drg = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg;
		var copy = angular.copy(source);
		copy.id = randomString(32);
		copy.closed = false;
		copy.active = false;
		copy.selected = false;
		// uol.push(copy);
		for(var copyChild1 in copy) {
			copy.id = randomString(32);
			if(copy.dr != null) {
				for(var c = 0; c < copy.dr.length; c++) {
					copy.dr[c].id = randomString(32);
					copy.dr[c].nid = '';
					if(copy.dr[c].drChild != null) {
						for(var d = 0; d < copy.dr[c].drChild.length; d++) {
							copy.dr[c].drChild[d].id = randomString(32);
						}
					}
				}
			}
		}
		drg.push(copy);
		$scope.toDbPutData('페이지 ' + source.title + ' 복제');
	};

	//DRG를 삭제했을 시 동작
	$scope.deleteDrg = function(index) {
		if($scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg.length === 1) {
			return;
		}
		else {
			var title = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[index].title;
			$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg.splice(index, 1);
			$scope.toDbPutData('페이지 ' + title + ' 삭제');
		}
	};

	//DR를 추가했을 시 동작
	$scope.addDr = function(drType, parent, grand_parent, idx){
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		if(parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			var isNone = false;
			if(dr[parent].drType == 'none' && drType != 'none') {
				dr.splice(parent, 1);
				isNone = true;
				if(parent != 0){
					parent = parent - 1;
				}
			}

			if(drType != 'none') {
				if(idx){
					if(isNone){
						idx = idx - 1;
					}
					dr.splice(idx + 1, 0, {
						id:randomString(32),
						nid:'',
						type:'dr',
						drType:drType,
						title:'내용을 입력하세요',
						body:'',
						answer:'',
						allowedTypes:['drChild'],
						drChild:{}
					});
					focusEvt(idx + 1);
				}else{
					if(!isNone){
						parent = parent + 1;
					}
					dr.splice(parent, 0, {
						id:randomString(32),
						nid:'',
						type:'dr',
						drType:drType,
						title:'내용을 입력하세요',
						body:'',
						answer:'',
						allowedTypes:['drChild'],
						drChild:{}
					});
					focusEvt(parent);
				}
			}
			else {
				dr.splice(parent + 1, 0, {
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:drType,
					title:'내용을 입력하세요',
					body:'',
					answer:'',
					allowedTypes:['drChild'],
					drChild:{}
				});
				focusEvt(parent + 1);
			}
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				answer:'',
				allowedTypes:['drChild'],
				drChild:{}
			});
			focusEvt(dr.length - 1);
		}

		$scope.toDbPutData('학습요소 추가');
	};

	//DR를 이동했을 시 동작
	$scope.moveDr = function(source, parent, dir) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
		var copy = angular.copy(source);
		if(dir == 'up'){
			var targetIdx = parent - 1;
		}else if(dir == 'down'){
			var targetIdx = parent + 1;
		}
		if(targetIdx == -1 || targetIdx == dr.length) return false;
		var copyTarget = angular.copy(dr[targetIdx]);
		dr[parent] = copyTarget;
		dr[targetIdx] = copy;
		focusEvt(targetIdx);

		$scope.toDbPutData('학습요소 ' + source.title + ' 이동');
	};

	//DR를 복제했을 시 동작
	$scope.copyDr = function(source, parent) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
		var copy = angular.copy(source);
		copy.id = randomString(32);
		if(copy.drChild !== undefined && copy.drChild.id !== undefined){
			copy.drChild.id = randomString(32);
		}
		copy.nid = '';
		// dr.push(copy);
		dr.splice(parent, 0, copy);
		focusEvt(parent + 1);
		$scope.toDbPutData('학습요소 ' + source.title + ' 복제');
	};

	//DR를 삭제했을 시 동작
	$scope.deleteDr = function(index) {
		var title = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[index].title;
		$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr.splice(index, 1);
		if($scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr.length === 0) {
			$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr = [{
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:'none',
				title:'내용을 입력하세요',
				body:'',
				answer:'',
				allowedTypes:['drChild'],
				drChild:{}
			}];
		}
		if(index >= $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr.length){
			index = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr.length - 1;
		}
		focusEvt(index, true);
		$scope.toDbPutData('학습요소 ' + title + ' 삭제');
	};

	//DR Quiz를 추가했을 시 동작
	$scope.addQuizDr = function(drType, parent, grand_parent){
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		if(grand_parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}

			dr.splice(parent + 1, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body: '',
				selectedQuiztab:false,
				correct:0,
				optionsTitle1:'',
				optionsTitle2:'',
				answer:'',
				maxGrade: 10,
				maxRetry: 1,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					body:'',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요',
						trueFalse:true
					}]
				}
			});
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body: '',
				selectedQuiztab:false,
				correct:0,
				optionsTitle1:'',
				optionsTitle2:'',
				answer:'',
				maxGrade: 10,
				maxRetry: 1,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					body:'',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요',
						trueFalse:true
					}]
				}
			});
			focusEvt(dr.length - 1);
		}
		$scope.toDbPutData('퀴즈 추가');
	};

	$scope.drQuizCorrectOption = function(index, dr) {
		dr.correct = index;
	};

	$scope.drQuizCorrectOptionMulti = function(option) {
		if(option.trueFalse == 'true') {
			option.trueFalse = 'false';
		}
		else {
			option.trueFalse = 'true';
		}
		$scope.toDbPutData('퀴즈 정답 선택');
	};

	$scope.deleteDrQuizOptions = function(index, options) {
		options.splice(index, 1);
		$scope.toDbPutData('퀴즈 옵션 삭제');
	};

	$scope.addDrQuizOptions = function(options, type) {
		options.push(
		{
			type:type,
			title:'내용을 입력하세요',
			trueFalse:'false'
		});
		$scope.toDbPutData('퀴즈 옵션 추가');
	};

	//DR Media를 추가했을 시 동작
	$scope.addMediaDr = function(mediaUrl){
		var parent = $scope.index_dialog;
		var grand_parent = $scope.grand_index_dialog;
		var mediaUrlTemp = mediaUrl.split('/');

		if(mediaUrlTemp[2] == 'youtu.be') {
			mediaUrl = 'https://www.youtube.com/embed/' + mediaUrlTemp[3];
		}

		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
		if(parent != null && grand_parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}

			dr.splice(parent + 1, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:'media',
				title:'내용을 입력하세요',
				body:'',
				url:mediaUrl
			});
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:'media',
				title:'내용을 입력하세요',
				body:'',
				url:mediaUrl
			});
			focusEvt(dr.length - 1);
		}
		$scope.toDbPutData('미디어 요소 추가');
	};

	$scope.addImageDr = function(drType, parent, grand_parent) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		if(grand_parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}

			dr.splice(parent + 1, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				selectedQuiztab:false,
				images:null,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요'
					}]
				}
			});
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				selectedQuiztab:false,
				images:null,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요'
					}]
				}
			});
			focusEvt(dr.length - 1);
		}

		$scope.toDbPutData('이미지 요소 추가');
	};

	$scope.addFileDr = function(drType, parent, grand_parent) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		if(grand_parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}
			// console.log(parent)
			dr.splice(parent + 1, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				selectedQuiztab:false,
				files:null,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요'
					}]
				}
			});
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				selectedQuiztab:false,
				files:null,
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요'
					}]
				}
			});
			focusEvt(dr.length - 1);
		}

		$scope.toDbPutData('파일 요소 추가');
	};

	$scope.addHomeworkDr = function(drType, parent, grand_parent) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		if(grand_parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}

			dr.splice(parent + 1, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				startDate:null,
				startTime:'00:00',
				start_hour:'',
				start_minute:'',
				endDate:null,
				endTime:'23:59',
				end_hour:'',
				end_minute:'',
				video:'false',
				sns:'false',
				ssz:'false',
				inputFile:'',
				score:'',
				evaluation:''
			});
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}else{
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}
			dr.push(
			{
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				body:'',
				startDate:null,
				startTime:'00:00',
				start_hour:'',
				start_minute:'',
				endDate:null,
				endTime:'23:59',
				end_hour:'',
				end_minute:'',
				video:'false',
				sns:'false',
				ssz:'false',
				inputFile:'',
				score:'',
				evaluation:''
			});
			focusEvt(dr.length - 1);
		}
		$scope.toDbPutData('과제 요소 추가');
	}

	$scope.strToDate = function (str,dir) {
		if(typeof str == 'number'){
			// 2016.1.1 기준
			if(str > 1451606400){
				return new Date(str * 1000);
			}else if(dir == 'end'){
				var endDate = new Date();
				var tempDate = new Date(endDate.setDate(endDate.getDate() + 8)).getTime();
				return new Date(tempDate - 1000);
			}else{
				return new Date();
			}
		}
		if(str) {
			return new Date(str);
		}
		else {
			if(dir == 'end'){
				var endDate = new Date();
				var tempDate = new Date(endDate.setDate(endDate.getDate() + 8)).getTime();
				return new Date(tempDate - 1000);
			}else{
				return new Date();
			}
		}
	}

	$scope.changeToDate = function (dr, dir, uol) {
		var getSt = new Date(dr.startDate);
		var getEnd = new Date(dr.endDate);
		var setSt = getSt;
		if(dr.start_hour){
			setSt.setHours(dr.start_hour * 1);
			setSt.setMinutes(dr.start_minute * 1);
		}else{
			setSt.setHours(0);
			setSt.setMinutes(0);
		}
		setSt.setSeconds(0);
		setSt.setMilliseconds(0);
		var setEnd = getEnd;
		if(dr.end_hour){
			setEnd.setHours(dr.end_hour * 1);
			setEnd.setMinutes(dr.end_minute * 1);
		}else{
			setEnd.setHours(0);
			setEnd.setMinutes(0);
		}
		setEnd.setSeconds(0);
		setEnd.setMilliseconds(0);
		setSt = setSt.getTime();
		setEnd = setEnd.getTime();
		if(dir == 'st' && setSt > setEnd){
			dr.startDate = new Date(getEnd.setDate(getEnd.getDate() - 1));
			alert('시작일은 마감일보다 이후일 수 없습니다.');
		}else if(dir == 'end' && setSt > setEnd){
			dr.endDate = new Date(getSt.setDate(getSt.getDate() + 1));
			alert('마감일은 시작일보다 이전일 수 없습니다.');
		}
		// console.log('is in')
		if(dir == 'st' && uol){
			dr.startDate = new Date(dr.startDate);
		}else if(dir == 'end' && uol){
			var tempDate = new Date(dr.endDate.setDate(dr.endDate.getDate() + 1)).getTime();
			dr.endDate = new Date(tempDate - 1000);
		}
	}

	$scope.initTime = function(dr){
		if(!dr.startTime) dr.startTime = '00:00';
		if(!dr.start_hour) dr.start_hour = '00';
		if(!dr.start_minute) dr.start_minute = '00';
		if(!dr.endTime) dr.endTime = '23:59';
		if(!dr.end_hour) dr.end_hour = '23';
		if(!dr.end_minute) dr.end_minute = '59';
	}

	$scope.cgTime = function(dr, value, dir) {
		var target = value.currentTarget;
		var getSt = dr.startDate.getDate();
		var getEnd = dr.endDate.getDate();
		if(dir == 'start'){
			if(target.value == false || target.value == '' || target.value == null){
				dr.startTime = '00:00';
			}else{
				dr.startTime = target.value;
			}
			var splitTime = dr.startTime.split(':');
			if(getSt == getEnd && ((dr.end_hour == splitTime[0] && dr.end_minute <= splitTime[1]) || dr.end_hour <= splitTime[0])){
				dr.startTime = '00:00';
				dr.start_hour = '00';
				dr.start_minute = '00';
				value.currentTarget.value = '00:00';
				alert('시작시간은 마감시간보다 이후일 수 없습니다.');
			}else{
				dr.start_hour = splitTime[0];
				dr.start_minute = splitTime[1];
			}
		}else if(dir == 'end'){
			if(target.value == false || target.value == '' || target.value == null){
				dr.endTime = '23:59';
			}else{
				dr.endTime = target.value;
			}
			var splitTime = dr.endTime.split(':');
			if(getSt == getEnd && ((dr.start_hour == splitTime[0] && dr.start_minute >= splitTime[1]) || dr.start_hour >= splitTime[0])){
				dr.endTime = '23:59';
				dr.end_hour = '23';
				dr.end_minute = '59';
				value.currentTarget.value = '23:59';
				alert('마감시간은 시작시간보다 이전일 수 없습니다.');
			}else{
				dr.end_hour = splitTime[0];
				dr.end_minute = splitTime[1];
			}
		}
	}

	$scope.drHomeworkVideo = function(dr) {
		if(dr.video == 'false') {
			dr.video = 'true';
		}
		else {
			dr.video = 'false';
		}
	}

	$scope.drHomeworkSns = function(dr) {
		if(dr.sns == 'false') {
			dr.sns = 'true';
		}
		else {
			dr.sns = 'false';
		}
	}

	$scope.drHomeworkSsz = function(dr) {
		if(dr.ssz == 'false') {
			dr.ssz = 'true';
		}
		else {
			dr.ssz = 'false';
		}
	}

	$scope.drHomeworkInputFile = function(dr, answer) {
		dr.inputFile = answer;
	}

	$scope.drHomeworkEvaluation = function(dr, evaluation) {
		dr.evaluation = evaluation;
	}

	$scope.flowSaveFile = function(flow, index) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
		var fileReader = new FileReader();
		if(flow.files[0] != null) {
			fileReader.readAsDataURL(flow.files[0].file);
			fileReader.onload = function(event) {
				dr[index].images = [{file:{result:event.target.result}}];
			};
		}
	};

	$scope.flowCancelFile = function(index) {
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
		dr[index].images = null;
	};

	$scope.isImageAdded = function(file, event, flow) {
		switch(file.file.type){
			case 'image/png':
			case 'image/gif':
			case 'image/jpg':
			case 'image/jpeg':
			flow.upload();
			break;
			default:
			$mdDialog.show({
				controller: cwController,
				templateUrl: '/views/templates/dialog/failFileUpload.html',
				parent: angular.element(document.body),
				clickOutsideToClose:true
			});
			return false;
		}
	};

	$scope.isFileAdded = function(file, event, flow) {
		// console.log(file)
		// switch(file.file.type){
		// 	case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		// 	case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		// 	case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		// 	case 'application/pdf':
		// 	case 'application/postscript':
		// 	case 'application/zip':
		// 	case 'image/vnd.adobe.photoshop':
		// 	case 'text/html':
		// 	case 'text/plain':
		// 	case 'video/mp4':
		// 	flow.upload();
		// 	break;
		// 	default:
		// 	$mdDialog.show({
		// 		controller: cwController,
		// 		templateUrl: '/views/templates/dialog/failFileUpload.html',
		// 		parent: angular.element(document.body),
		// 		clickOutsideToClose:true
		// 	});
		// 	return false;
		// }
	};

	$scope.addLtiDr = function(ltiObject) {
		var parent = $scope.index_dialog;
		var grand_parent = $scope.grand_index_dialog;
		var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;

		ltiObject.id = randomString(32);
		ltiObject.title = 'LTI';
		ltiObject.type = 'dr';
		ltiObject.drType = 'lti';
		ltiObject.nid = '';

		if(grand_parent != null && parent != null) {
			if(dr.length <= parent){
				parent = parent - 1;
			}
			if(dr[parent].drType == 'none') {
				dr.splice(parent, 1);
				parent = parent - 1;
			}

			dr.splice(parent + 1, 0, ltiObject);
			focusEvt(parent + 1);
			$scope.index_dialog = null;
			$scope.grand_index_dialog = null;
		}
		else {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}

			dr.push(ltiObject);
		}

		$scope.toDbPutData('LTI 요소 추가');
	};

	$scope.drQuizTrueFalseSwitch = function(index, no) {
		$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[index].drChild.trueFalse = no;
	};
	$scope.ltiGetPastGrade = function(on) {
		$scope.ltiObject.getPastGrade = on;
	};
	$scope.ltiExpressionName = function(on) {
		$scope.ltiObject.expressionName = on;
	};
	$scope.ltiNewPageOpen = function(on) {
		$scope.ltiObject.newPageOpen = on;
	};
	$scope.ltiRequestUserEmail = function(on) {
		$scope.ltiObject.RequestUserEmail = on;
	};
	$scope.ltiRequestUserName = function(on) {
		$scope.ltiObject.RequestUserName = on;
	};
	$scope.ltiGettingScore = function(on) {
		$scope.ltiObject.gettingScore = on;
	};
	$scope.ltiGettingWeigth = function(on) {
		$scope.ltiObject.gettingWeigth = on;
	};

	$scope.index_dialog = null;
	$scope.grand_index_dialog = null;
	$scope.drGetClickIndex = function(type, index, parent, grand_parent){
		if($scope.uolActive != $scope.selectedUol){
			return false;
		}
		// console.log(parent, grand_parent)
		switch(type) {
			case 'media':
			// Media //
			$scope.index_dialog = parent;
			$scope.grand_index_dialog = grand_parent;
			$scope.showTabDialog(event, type, index, parent);
			break;
			case 'media_operator':
			// Media //
			$scope.index_dialog = parent;
			$scope.grand_index_dialog = grand_parent;
			$scope.showTabDialog(event, type, index, parent);
			break;
			case 'quiz':
			// Quiz //
			$scope.addQuizDr(type, parent, grand_parent);
			break;
			case 'image':
			// Image //
			$scope.addImageDr(type, parent, grand_parent);
			break;
			case 'file':
			$scope.addFileDr(type, parent, grand_parent);
			break;
			case 'homework':
			$scope.addHomeworkDr(type, parent, grand_parent);
			break;
			case 'lti':
			// LTI //
			$scope.index_dialog = parent;
			$scope.grand_index_dialog = grand_parent;
			$scope.showTabDialog(event, type, index, parent);
			break;
			case 8:
			// Scroll Top //
			// angular.element('html, body').stop().animate( { scrollTop : '0' }, 300 );
			break;
			default:
			// Others //
			$scope.addDr(type, parent, grand_parent, parent);
			break;
		}
	};

	//DR를 이동했을 시 동작
	$scope.moveSurveyDr = function(source, parent, dir) {
		var dr = $scope.cwList.survey.dr;
		var copy = angular.copy(source);
		if(dir == 'up'){
			var targetIdx = parent - 1;
		}else if(dir == 'down'){
			var targetIdx = parent + 1;
		}
		if(targetIdx == -1 || targetIdx == dr.length) return false;
		var copyTarget = angular.copy(dr[targetIdx]);
		dr[parent] = copyTarget;
		dr[targetIdx] = copy;
		focusEvt(targetIdx);

		$scope.toDbPutData('학습요소 ' + source.title + ' 이동');
	};

	$scope.addSurveyQuizDr = function(drType, index){
		var dr = $scope.cwList.survey.dr;
		if(index == undefined){ index = $scope.selectedDr;}
		if(index == null) {
			if(dr.length == 1) {
				if(dr[0].drType == 'none') {
					dr.shift();
				}
			}
			dr.push({
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				selectedQuiztab:false,
				correct:null,
				optionsTitle1:'',
				optionsTitle2:'',
				answer:'',
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					body:'',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요',
						trueFalse:'false'
					}]
				}
			});
			focusEvt(dr.length - 1);
		}
		else {
			if(dr[index].drType == 'none') {
				dr.splice(index, 1);
			}else{
				index = index + 1;
			}
			dr.splice(index, 0, {
				id:randomString(32),
				nid:'',
				type:'dr',
				drType:drType,
				title:'내용을 입력하세요',
				selectedQuiztab:false,
				correct:null,
				optionsTitle1:'',
				optionsTitle2:'',
				answer:'',
				drChild:
				{
					id:randomString(32),
					drType:drType,
					drChildTypeIndex:0,
					title:'내용을 입력하세요',
					body:'',
					allowedTypes:[$scope.drQuizTabList[0]],
					options:
					[{
						type:$scope.drQuizTabList[0],
						title:'내용을 입력하세요',
						trueFalse:'false'
					}]
				}
			});
			focusEvt(index);
		}

		$scope.toDbPutData('설문평가 퀴즈 추가');
	};

	$scope.addSurveyDr = function(type, index) {
		var noneDr = {
			id:randomString(32),
			nid:'',
			type:'dr',
			drType:type,
			title:'내용을 입력하세요',
			selectedQuiztab:false,
			correct:null,
			optionsTitle1:'',
			optionsTitle2:'',
			answer:'',
			drChild:
			{
				id:randomString(32),
				drType:type,
				drChildTypeIndex:0,
				title:'내용을 입력하세요',
				body:'',
				allowedTypes:[$scope.drQuizTabList[0]],
				options:
				[{
					type:$scope.drQuizTabList[0],
					title:'내용을 입력하세요',
					trueFalse:'false'
				}]
			}
		};
		$scope.cwList.survey.dr.splice(index+1, 0, noneDr);
	};

	$scope.copySurveyDr = function(dr, index) {
		var copy = angular.copy(dr);
		copy.id = randomString(32);
		$scope.cwList.survey.dr.splice(index+1, 0, copy);
		$scope.toDbPutData('설문평가 퀴즈 복제');
	};

	$scope.deleteSurveyDr = function(index) {
		$scope.cwList.survey.dr.splice(index, 1);
		$scope.toDbPutData('설문평가 퀴즈 삭제');
	};

	$scope.survey_clear_default = function(index, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'survey') {
				$scope.cwList.survey.dr[index].title = '';
			}
		};
	};
	$scope.survey_input_default = function(index, text, depth) {
		if(text == '') {
			if(depth == 'survey') {
				$scope.cwList.survey.dr[index].title = '내용을 입력하세요';
			}
		};
	};
	$scope.survey_option_clear_default = function(pindex, index, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'option') {
				$scope.cwList.survey.dr[pindex].drChild.options[index].title = '';
			}
		};
	};
	$scope.survey_option_input_default = function(pindex, index, text, depth) {
		if(text == '') {
			if(depth == 'option') {
				$scope.cwList.survey.dr[pindex].drChild.options[index].title = '내용을 입력하세요';
			}
		};
	};

	/*
	*  페이지 탭 컨트롤 함수 Start
	*/
	$scope.chanegeDrg = function(selectedDrg) {
		$scope.selectedDrg = selectedDrg;
	};

	$scope.isActiveDrg = function(selectedDrg) {
		return $scope.selectedDrg === selectedDrg;
	};

	$scope.isActiveQuiz = function(selectedQuiz, dr) {
		return dr.drChild.drChildTypeIndex === selectedQuiz;
	};

	$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

	// if($rootScope.emptyItem){
	// 	$scope.emptyItem = $rootScope.emptyItem;
	// }

	// 외부파일을 로드하여 Dialog를 여는 함수 //
	$scope.showAdvanced = function(ev, path) {
		var closeBool = true;
		if(path == 'save_confirmDialog.html') {
			// $rootScope.emptyItem = new Array();
			// for(var u = 0;u < $scope.cwList.uol.length;u++){
			// 	for(var l = 0;l < $scope.cwList.uol[u].lo.length;l++){
			// 		for(var d = 0;d < $scope.cwList.uol[u].lo[l].drg.length;d++){
			// 			for(var r = 0;r < $scope.cwList.uol[u].lo[l].drg[d].dr.length;r++){
			// 				if($scope.cwList.uol[u].lo[l].drg[d].dr[r].drType == 'none'){
			// 					$rootScope.emptyItem.push({uolIdx: u, loIdx: l, drgIdx: d, drIdx: r, loTitle: $scope.cwList.uol[u].lo[l].title, drgTitle: $scope.cwList.uol[u].lo[l].drg[d].title});
			// 				}
			// 			}
			// 		}
			// 	}
			// }
			// if($rootScope.emptyItem.length != 0) return $scope.showAdvanced(ev, 'emptyContentsDialog.html');
			$rootScope.tempSaveData = JSON.parse(JSON.stringify($scope.cwList));
			$scope.toDbPutData('데이터 저장');
		}else if(path == 'revisionDialog.html') {
			$rootScope.tempSaveData = JSON.parse(JSON.stringify($scope.cwList));
			$scope.toDbPutData('데이터 저장');
		}else if(path == 'save_progressDialog.html') {
			for(var u = 0;u < $scope.cwList.uol.length;u++){
				for(var l = 0;l < $scope.cwList.uol[u].lo.length;l++){
					for(var d = 0;d < $scope.cwList.uol[u].lo[l].drg.length;d++){
						for(var r = $scope.cwList.uol[u].lo[l].drg[d].dr.length - 1;r >= 0;r--){
							if($scope.cwList.uol[u].lo[l].drg[d].dr.length == 1 && $scope.cwList.uol[u].lo[l].drg[d].dr[r].drType == 'none'){
							}else if($scope.cwList.uol[u].lo[l].drg[d].dr.length > 1 && $scope.cwList.uol[u].lo[l].drg[d].dr[r].drType == 'none'){
								$scope.cwList.uol[u].lo[l].drg[d].dr.splice(r,1);
							}
						}
					}
				}
			}
			$rootScope.tempSaveData = JSON.parse(JSON.stringify($scope.cwList));
			closeBool = false;
		}
		if(!$scope.disable) {
			var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			$mdDialog.show({
				controller: cwController,
				templateUrl: '/views/templates/dialog/' + path,
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:closeBool,
				onComplete: afterOpen,
				fullscreen: useFullScreen
			})
			.then(function(answer) {
				$scope.status = 'You said the information was "' + answer + '".';
			}, function() {
				$scope.status = 'You cancelled the dialog.';
			});
			$scope.$watch(function() {
				return $mdMedia('xs') || $mdMedia('sm');
			}, function(wantsFullScreen) {
				$scope.customFullscreen = (wantsFullScreen === true);
			});

			function afterOpen() {
				if(path == 'save_progressDialog.html') {
					$scope.toDbPutData('강좌 내보내기');
					$scope.save_complete();
				}
			}
		}
	};

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.answer = function() {
		$mdDialog.hide();
		$rootScope.$broadcast('sendMediaUrl', $scope.mediaUrl);
	};
	$scope.ltiAnswer = function() {
		$mdDialog.hide();
		$rootScope.$broadcast('sendLtiObject', $scope.ltiObject);
	};
	$scope.toDbGetDataDialog = function(time) {
		$mdDialog.hide();
		$rootScope.$broadcast('toDbGetData', time);
	};
	$scope.exportingFileDownload = function(format) {
		$rootScope.$broadcast('exportingFileDownloads', format);
	};
	$scope.getContentsFromXinics = function() {
		$rootScope.$broadcast('getContentFromXinics');
	};
	$scope.$on('sendMediaUrl', function(evt, arg) {
		$scope.addMediaDr(arg);
	});
	$scope.$on('sendLtiObject', function(evt, arg) {
		$scope.addLtiDr(arg);
	});
	$scope.$on('toDbGetData', function(evt, arg) {
		$scope.toDbGetData(arg);
	});
	$scope.$on('exportingFileDownloads', function(evt, arg) {
		if(arg == 'olx') {
			$scope.exportToEdx();
		}
	});

	var getContentFromXinicsListener = $scope.$on('getContentFromXinics', function(evt, arg) {
		$mdDialog.hide();
		$scope.getContens($scope.index_dialog);
	});

	$scope.$on('$destroy', function() {
		getContentFromXinicsListener();
	});

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	//클래스 변경용 func 등록
	$scope.activeButton = function(event){
		angular.element('.container').hide();
		event.currentTarget.className = 'active';
	};

	//DB 연동
	$scope.toDbPutData = function(actions, data) {
		if(actions == null) {
			actions = '사용자 저장';
		}
		if($rootScope.tempSaveData){
			var jsonData = JSON.stringify($rootScope.tempSaveData);
			$rootScope.tempSaveData = false;
		}else{
			var jsonData = JSON.stringify($scope.cwList);
		}
		var date = getTimeStamp();
		jsonData = JSON.parse(jsonData);
		for(var a = 0;a < jsonData.uol.length;a++){
			if(typeof jsonData.uol[a].startDate !== 'number'){
				var getstartDate = new Date(jsonData.uol[a].startDate).getTime();
				jsonData.uol[a].startDate = Math.ceil(getstartDate / 1000);
			}
			if(typeof jsonData.uol[a].endDate !== 'number'){
				var getendDate = new Date(jsonData.uol[a].endDate).getTime();
				jsonData.uol[a].endDate = Math.ceil(getendDate / 1000);
			}
		}
		jsonData = JSON.stringify(jsonData);
		OcatToMongoDb.putData({time:date + ' ' + actions, data:jsonData, nid:$scope.cwNid});
		// OcatToMongoDb.putData({time:date, actions:actions, data:jsonData, nid:$scope.cwNid});
		if($scope.dataDates.length == 0) {
			$scope.dataDates = [JSON.parse(JSON.stringify({time:date + ' ' + actions}))];
			// $scope.dataDates = [JSON.parse(JSON.stringify({ time:date, actions:actions }))];
		}
		else {
			$scope.dataDates.push(JSON.parse(JSON.stringify({time:date + ' ' + actions})));
			// $scope.dataDates.push(JSON.parse(JSON.stringify({ time:date, actions:actions })));
		}
	};

	$scope.toDbPutDataDialog = function(event, actions) {
		$mdDialog.hide();
		$rootScope.$broadcast('toDbPutDataDialogBroadcast');
	};

	$scope.$on('toDbPutDataDialogBroadcast', function(evt) {
		var actions = '사용자 저장';
		var date = getTimeStamp();
		if($rootScope.tempSaveData){
			var jsonData = JSON.stringify($rootScope.tempSaveData);
			$rootScope.tempSaveData = false;
		}else{
			var jsonData = JSON.stringify($scope.cwList);
		}
		jsonData = JSON.parse(jsonData);
		for(var a = 0;a < jsonData.uol.length;a++){
			if(typeof jsonData.uol[a].startDate !== 'number'){
				var getstartDate = new Date(jsonData.uol[a].startDate).getTime();
				jsonData.uol[a].startDate = Math.ceil(getstartDate / 1000);
			}
			if(typeof jsonData.uol[a].endDate !== 'number'){
				var getendDate = new Date(jsonData.uol[a].endDate).getTime();
				jsonData.uol[a].endDate = Math.ceil(getendDate / 1000);
			}
		}
		jsonData = JSON.stringify(jsonData);
		var event = null;
		OcatToMongoDb.putData({time:date + ' ' + actions, data:jsonData, nid:$scope.cwNid});
		if($scope.dataDates.length == 0) {
			$scope.dataDates = [JSON.parse(JSON.stringify({time:date + ' ' + actions}))];
		}
		else {
			$scope.dataDates.push(JSON.parse(JSON.stringify({time:date + ' ' + actions})));
		}
	});

	$scope.toDbDeleteData = function() {
		OcatToMongoDb.deleteDatas({nid:$scope.cwNid});
		$scope.dataDates = [];
		$mdDialog.cancel();
	};

	$scope.toDbDeleteDataDialog = function(event) {
		$scope.showTabDialog(event, null, 100);
	};

	$scope.toDbGetData = function(timed) {
		OcatToMongoDb.getData({time:timed, nid:$scope.cwNid}).then(function(response) {
			$scope.cwList = forStringParse(response.data);
		});
	};

	function forStringParse(str){
		if(typeof str == 'string'){
			str = JSON.parse(str);
			return forStringParse(str);
		}else{
			return str;
		}
	}

	//디버깅 용도: 변경된 데이터를 실시간으로 볼 수 있다.
	$scope.$watch('cwList', function(cwList) {
		$scope.modelAsJson = angular.toJson(cwList, true);
	}, true);

	//클래스 변경용 func 등록
	$scope.activeButton = function(event){
		angular.element('.container').hide();
		event.currentTarget.className = 'active';
	};

	// 모든 요소 비활성화 //
	$scope.disable = 0;
	$scope.lock_allContent = function(event) {
		if($scope.disable) {
			$scope.disable = 0;
		}
		else {
			$scope.disable = 1;
		}
	};

	// 과제 Select List //
	$scope.enable_selectList = false;
	$scope.click_selectLlist = function(index, event) {
		if($scope.enable_selectList) {
			$scope.enable_selectList = false;
		} else {
			$scope.enable_selectList = true;
		}
	};

	//======== 설문 ========//
	$scope.pollList = [
	{
		title : '',
		type : 'none',
	}
	];

	// 코스저장 //
	$scope.exportToEdx = function() {
		var date = getTimeStamp();
		var jsonData = JSON.stringify($scope.cwList);
		//console.log($scope.cwList);
		OcatToMongoDb.putData({time:date + ' edX Exporting', data:jsonData, nid:$scope.cwNid});
		if($scope.dataDates.length == 0) {
			$scope.dataDates = [JSON.parse(JSON.stringify({time:date + ' edX Exporting'}))];
		}
		else {
			$scope.dataDates.push(JSON.parse(JSON.stringify({time:date + ' edX Exporting'})));
		}
		window.open('/api/ocat/edxexport/' + date + ' edX Exporting');
		// OcatToMongoDb.exportToEdxDownload({time:date}).then(function(response) {
		//  console.log(response);
		// });
	};

	function utf8_to_b64( str ) {
	  return window.btoa(unescape(encodeURIComponent( str )));
	}

	function b64_to_utf8( str ) {
	  return decodeURIComponent(escape(window.atob( str )));
	}

	$scope.migrationToDrupal = function() {
		var senddata = {};
		senddata.data = JSON.parse(JSON.stringify($scope.cwList));
		var sess_name = window.sessionStorage.getItem('session_name');
		var sess_id = window.sessionStorage.getItem('sessid');
		var token = window.sessionStorage.getItem('drupaltoken');
		senddata.sess_name = sess_name;
		senddata.sess_id = sess_id;
		senddata.token = token;
		senddata.hostname = $scope.hostname;
		senddata.langcode = $scope.langcode;
		$rootScope.$broadcast('ocatToDrupalMid');

		for(var a = 0;a < senddata.data.uol.length;a++){
			if(typeof senddata.data.uol[a].startDate !== 'number'){
				var getstartDate = new Date(senddata.data.uol[a].startDate).getTime();
				senddata.data.uol[a].startDate = Math.ceil(getstartDate / 1000);
			}
			if(typeof senddata.data.uol[a].endDate !== 'number'){
				var getendDate = new Date(senddata.data.uol[a].endDate).getTime();
				senddata.data.uol[a].endDate = Math.ceil(getendDate / 1000);
			}
		}

		$rootScope.$broadcast('ocatToDrupalMid2');

		OcatToDrupal.exportToIMOOVE(senddata).then(function(response) {
			var date = getTimeStamp();
			var jsonData = JSON.stringify($scope.cwList);

			OcatToMongoDb.putData({ time:date + ' iMoove2로 저장', data:jsonData, nid:$scope.cwNid });
			if($scope.dataDates.length == 0) {
				$scope.dataDates = [JSON.parse(JSON.stringify({time:date + ' iMoove2로 저장'}))];
			}
			else {
				$scope.dataDates.push(JSON.parse(JSON.stringify({time:date + ' iMoove2로 저장'})));
			}
			$rootScope.$broadcast('ocatToDrupalEnd');
		});
	};

	$scope.$on('ocatToDrupalMid', function() {
		$scope.exportProgress = 50;
		angular.element('#save_progressDialog').find('.progress-message').text('강좌 데이터 전송 중...');
	});

	$scope.$on('ocatToDrupalMid2', function() {
		$scope.exportProgress = 75;
		angular.element('#save_progressDialog').find('.progress-message').text('강좌 저장 중...');
	});

	$scope.$on('ocatToDrupalEnd', function() {
		$scope.exportProgress = 100;
		// angular.element('#save_progressDialog').find('.progress-message').text('저장 완료');
		angular.element('#save_progressDialog').find('.progress-message').html('<div style="text-align:center; color: rgb(0,50,117); padding: 5px 30px 65px;">저장이 완료 되었습니다.</div>');
		angular.element('#save_progressDialog').find('.progress-bar-wrapper').hide();
		// angular.element('#save_progressDialog').find('.message').text('저장이 완료되었습니다.');
		angular.element('#save_progressDialog').find('.message').html('<div class="image_replacement"></div>');
		angular.element('#save_progressDialog').find('.complete_button').show();
		angular.element('#save_progressDialog').addClass('complete');
	});

	// 클릭 시 기본 텍스트 //
	$scope.uol_clear_default = function(index, event, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'uol') {
				$scope.cwList.uol[index].title = '';
			}
		};
	}

	$scope.lo_clear_default = function(pindex, index, event, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'lo') {
				$scope.cwList.uol[pindex].lo[index].title = '';
			}
		};
	}

	$scope.drg_clear_default = function(ppindex, pindex, index, event, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'drg') {
				$scope.cwList.uol[ppindex].lo[pindex].drg[index].title = '';
			}
		};
	}

	$scope.dr_clear_default = function(index, event, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'dr') {
				$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[index].title = '';
			}
		};
	}

	$scope.option_clear_default = function(pindex, index, event, text, depth) {
		if(text == '내용을 입력하세요') {
			if(depth == 'option') {
				$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[pindex].drChild.options[index].title = '';
			}
		};
	}

	$scope.uol_input_default = function(index, event, text, depth) {
		if(text == '' || undefined) {
			if(depth == 'uol') {
				$scope.cwList.uol[index].title = '내용을 입력하세요';
			}
		}
	};

	$scope.lo_input_default = function(pindex, index, event, text, depth) {
		if(text == '' || undefined) {
			if(depth == 'lo') {
				$scope.cwList.uol[pindex].lo[index].title = '내용을 입력하세요';
			}
		};
	}

	$scope.drg_input_default = function(ppindex, pindex, index, event, text, depth) {
		if(text == '' || undefined) {
			if(depth == 'drg') {
				$scope.cwList.uol[ppindex].lo[pindex].drg[index].title = '내용을 입력하세요';
			}
		};
	}

	$scope.dr_input_default = function(index, event, text, depth) {
		if(text == '' || undefined) {
			if(depth == 'dr') {
				$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[index].title = '내용을 입력하세요';
			}
		};
	}

	$scope.option_input_default = function(pindex, index, event, text, depth) {
		if(text == '' || undefined) {
			if(depth == 'option') {
				$scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr[pindex].drChild.options[index].title = '내용을 입력하세요';
			}
		};
	}

	$scope.getMediaIframe = function() {
		//다시 눌렀을 때 중복생성 막기
		if(document.getElementById("myMediaFrame") !== null){
			return false;
		}
	};

	$scope.getContens = function(drIndex = null) {
		var cid = encodeURIComponent(window.localStorage.getItem('cid'));
		if(drIndex != null) {
			GetContentsFromDb.getData({cid:cid}).then(function(response) {
				var contentsData = JSON.parse(response[0].data);
				// console.log(contentsData);
				var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
				if(dr[drIndex].drType == 'none'){
					dr.splice(drIndex, 1);
				}else{
					drIndex++;
				}
				dr.splice(drIndex, 0,
				{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'media',
					title:contentsData.title,
					body:contentsData.content,
					url:contentsData.view_url,
					info:contentsData
				});
				$scope.toDbPutData('미디어 요소 추가');
				focusEvt(drIndex);
			});
		}
		else {
			GetContentsFromDb.getData({cid:cid}).then(function(response) {
				var contentsData = JSON.parse(response[0].data);
				// console.log(contentsData);
				var dr = $scope.cwList.uol[$scope.selectedUol].lo[$scope.selectedLo].drg[$scope.selectedDrg].dr;
				if(dr.length == 1) {
					if(dr[0].drType == 'none') {
						dr.shift();
					}
				}
				dr.push(
				{
					id:randomString(32),
					nid:'',
					type:'dr',
					drType:'media',
					title:contentsData.title,
					body:contentsData.content,
					url:contentsData.view_url,
					info:contentsData
				});
				$scope.toDbPutData('미디어 요소 추가');
				focusEvt(dr.length - 1);
			});
		}
	};

	$scope.waiting_load_content = function() {
		console.log("loading...");
	};

	// angular.element(window).load(function() {
	// 	console.log("load complete");
	// });

	/* window resize시 uol 스크롤 생성 유무를 위한 함수 선언 */
	angular.element(window).resize(function(){
		$timeout(function(){
			$scope.cwListUolLength = $scope.cwList.uol.length * 65 + 15;
			setScrollbar($scope.cwListUolLength);
		},300);
	});

	/* setting week btn func */
	$scope.switchEditDate = function(uol){
		uol.startDate = $scope.strToDate(uol.startDate, 'st');
		uol.endDate = $scope.strToDate(uol.endDate, 'end');
		$scope.isEditDate ? $scope.isEditDate = false : $scope.isEditDate = true;
	}

	/* add scrollbar in uol list */
	function setScrollbar(length){
		var windowWidth = window.innerWidth - 220;
		addScroll('#uol_menu_wrap', length, windowWidth);
		if (length > windowWidth){
			$scope.tabLengthOver = true;
		} else {
			$scope.tabLengthOver = false;
		}
	}

	// Dr add event focus //
	function focusEvt(idx, isDelete){
		$timeout(function () {
			var el = document.getElementsByClassName('dr')[idx];
			var getTopOffset = el.offsetTop;
			angular.element(el).triggerHandler('click');
			if(!isDelete){
				document.body.scrollTop = getTopOffset + 50;
			}
			$scope.selectedDr = idx;
		}, 0);
	}

	$scope.toggle_this_feedback = function(ele) {
		if(ele.target.parentElement.className.indexOf('closed') > -1){
			angular.element(ele.target.parentElement).removeClass('closed');
		}else{
			angular.element(ele.target.parentElement).addClass('closed');
		}
	}
}

// DR Controller //
var drController = function($scope) {
	$scope.enableDr = function(event, idx) {
		// angular.element('.dr').hide();
		jQuery('.inner_container').find('.dr').removeClass('active');

		var classes = event.currentTarget.className;
		classes += ' active';
		event.currentTarget.className = classes;

		if($scope.activeMenuTab2 && typeof idx == 'number'){
			$scope.$parent.$parent.$parent.selectedDr = idx;
		}
	};
}

angular.module('ocatApp').controller('cwController', cwController);
angular.module('ocatApp').controller('drController', drController);
