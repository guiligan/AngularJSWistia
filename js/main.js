'use strict';

angular
    .module('script', ['ngSanitize', 'ngMaterial', 'ngMessages', 'md-imp-uploader'])
    .controller('uploader', function($scope) {
        $scope.progressBar = true;
        $scope.showResult = true;
    });