﻿var app = angular.module('app', ['ngRoute', 'gridster', 'angularjs-gauge', 'angularUtils.directives.dirPagination'])

app.config(function ($routeProvider, $locationProvider) {
  // Initialize data
  //$locationProvider.html5Mode(true)

  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl',
      auth: false
    })
    .when('/sign_up', {
      templateUrl: 'views/authentication/sign_up.html',
      auth: false
    })
    .when('/sign_in', {
      templateUrl: 'views/authentication/sign_in.html',
      controller: 'SignInCtrl',
      auth: false
    })
    .when('/forgot_password', {
      templateUrl: 'views/authentication/forgot_password.html',
      controller: 'SignInCtrl',
      auth: false
    })
    .when('/workers', {
      templateUrl: 'views/dashboard/workers.html',
      controller: 'workerCtrl',
      auth: true
    })
    .when('/active', {
      templateUrl: 'views/dashboard/active.html',
      controller: 'activeTaskGroupCtrl',
      auth: true
    })
    .when('/finished', {
      templateUrl: 'views/dashboard/finished.html',
      controller: 'finishedTaskGroupCtrl',
      auth: true
    })
    .otherwise({
      redirectTo: '/'
    })
})

app.run(function ($rootScope, $location, $window, $http, gridsterConfig) {
  gridsterConfig.defaultSizeX = 2;
  gridsterConfig.defaultSizeY = 1;
  gridsterConfig.resizable.enabled = false;
  gridsterConfig.columns = 6;

  $rootScope.signedUser = null

  $http
    .get('/signed_in')
    .then(function (response) {
      $rootScope.signedUser = response.data

      $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.auth && !$rootScope.signedUser) {
          $location.path('/sign_in')
          return
        }

        if (next.route) {
          $window.location.href = next.route
          return
        }
      });
    })
});
