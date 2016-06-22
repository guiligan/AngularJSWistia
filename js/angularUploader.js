'use strict';

;(function(){
    if(typeof angular != 'object') {
        console.log('AngularJS not loaded!');
        return;
    }
    else if(typeof jQuery != 'function') {
        console.log('jQuery not loaded!');
        return;
    }
    else if(typeof jQuery().fileupload != 'function') {
        console.log('blueimp not loaded!');
        return;
    }

    angular.module('md-imp-uploader', ['ngMaterial'])
        .directive('mdImpUploader', function($mdToast, $window) {
            return {
                template: '<form id="fileupload" action="#" method="POST" enctype="multipart/form-data" layout="column" layout-align="center center" id="projectForm" name="projectForm">' +
                '   <md-input-container class="md-block" style="margin-top: 50px">' +
                '       <label>API Password</label>' +
                '       <input required type="text" name="apiPassword" id="apiPassword" ng-model="apiPassword" style="width: 50vw" />' +
                '       <div ng-messages="projectForm.apiPassword.$error" multiple md-auto-hide="false">' +
                '            <div ng-message="required">This field is required</div>' +
                '       </div>' +
                '   </md-input-container>' +
                '   <md-button class="md-raised md-primary">' +
                '       Click here to select video for upload' +
                '       <input type="file" name="files[]" style="position: absolute; opacity: 0; top: 0; right: 0; width: 100%; height: 100%" />' +
                '   </md-button>' +
                '   <div ng-show="uploading" style="position: fixed; width: 100%; height: 100%; background: rgba(0, 0 , 0, 0.3); top: 0; left: 0; z-index: 100" layout="column" layout-align="center center">' +
                '       <md-progress-circular md-mode="{{progressMode}}" value="{{progress}}" md-diameter="150vmin"></md-progress-circular>' +
                '       <h2>Please wait while we upload your video... {{progress}}%</h2>' +
                '   </div>' +
                '   <div class="wistia_embed wistia_async_{{playerCode}}" ng-show="showPlayer==true" style="width:640px; height:360px;"></div>' +
                '</form>',
                restrict: 'E',
                scope: {
                    progressBar: '=',
                    impOptions: '=',
                    doneCallback: '=',
                    showResult: '='
                },
                link: function($scope) {
                    if($scope.impOptions == 'undefined') {
                        $scope.impOptions = {};
                    }

                    if($scope.progressBar == 'undefined') {
                        $scope.progressBar = true;
                    }

                    if($scope.showResult == 'undefined') {
                        $scope.showResult = true;
                    }

                    $scope.apiPassword = '';
                    $scope.uploading = false;
                    $scope.progressMode = 'indeterminate';
                    $scope.progress = 0;
                    $scope.showPlayer = false;
                    $scope.video = null;
                    $scope.playerCode = '';
                    $scope.options = angular.extend({}, $scope.impOptions, {
                        url: 'https://upload.wistia.com/',
                        type: 'POST',
                        singleFileUploads: true,
                        multipart: true,
                        paramName: 'file',
                        formData: {
                            api_password: $scope.apiPassword
                        },
                        send: function(e, data) {
                            if($scope.progressBar == true) {
                                $scope.$apply(function() {
                                    $scope.progress = 0;
                                    $scope.uploading = true;
                                    $scope.showPlayer = false;

                                    if($scope.video != null) {
                                        $scope.video.remove();
                                        $scope.video = null;
                                    }
                                });
                            }
                        },
                        progress: function(e, data) {
                            $scope.$apply(function() {
                                $scope.progressMode = 'determinate';
                                $scope.progress = parseInt(data.loaded / data.total * 100, 10);
                            });
                        },
                        fail: function(e, data) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Ops, upload failed. Please try again!')
                                    .position('top right')
                                    .hideDelay(5000)
                            );

                            $scope.$apply(function() {
                                $scope.uploading = false;
                                $scope.progressMode = 'indeterminate';
                            });
                        },
                        done: function(e, data) {
                            $scope.$apply(function() {
                                $scope.uploading = false;
                                $scope.progressMode = 'indeterminate';
                                if(typeof $scope.doneCallback == 'function') {
                                    $scope.doneCallback(e, data);
                                }

                                if($scope.showResult == true) {
                                    $scope.showPlayer = true;
                                    $scope.playerCode = data.result.hashed_id;
                                    $scope.video = Wistia.api(data.result.hashed_id);
                                }
                            });

                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Upload complete!')
                                    .position('top right')
                                    .hideDelay(5000)
                            );
                        }
                    });

                    $('#fileupload').fileupload($scope.options);

                    $scope.$watch('apiPassword', function() {
                        $scope.options.formData.api_password = $scope.apiPassword;
                        $('#fileupload').fileupload($scope.options);
                    });
                }
            }
        })
})();