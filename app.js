var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/medicines", {
      templateUrl: "views/medicines.html",
      controller: "MedicinesController",
    })
    .when("/about", {
      templateUrl: "views/about.html",
    })
    .when("/login", {
      templateUrl: "views/login.html",
    })
    .when("/register", {
      templateUrl: "views/register.html",
    })
    .when("/users", {
      templateUrl: "views/user.html",
      controller: "UsersController",
    })
    .when("/user-detail/:id", {
      templateUrl: "views/user-detail.html",
      controller: "UserDetailController",
    })
    .when("/medicine-detail/:id", {
      templateUrl: "views/medicines-detail.html",
      controller: "MedicineDetailController",
    })
    .otherwise({ redirectTo: "/medicines" });
});

app.run(function ($rootScope) {
  // Initial state for testing
  $rootScope.isLoggedIn = false;
  $rootScope.userRole = "admin";

  $rootScope.logout = function () {
    $rootScope.isLoggedIn = false;
    window.location.href = "#!/login";
  };
});
