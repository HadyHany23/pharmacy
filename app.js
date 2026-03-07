var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "AuthController",
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "AuthController",
    })
    .when("/medicines", {
      templateUrl: "views/medicines.html",
      controller: "MedicinesController",
      requireLogin: true,
    })
    .when("/medicine-detail/:id", {
      templateUrl: "views/medicines-detail.html",
      controller: "MedicineDetailController",
      requireLogin: true,
    })
    .when("/cart", {
      templateUrl: "views/cart.html",
      controller: "CartController",
      requireLogin: true,
    })
    .when("/checkout", {
      templateUrl: "views/checkout.html",
      controller: "CheckoutController",
      requireLogin: true,
    })
    .when("/history", {
      templateUrl: "views/history.html",
      controller: "HistoryController",
      requireLogin: true,
    })
    .when("/profiles", {
      templateUrl: "views/profiles.html",
      controller: "ProfilesController",
      requireLogin: true,
      role: "admin",
    })
    .when("/users", {
      templateUrl: "views/user.html",
      controller: "UsersController",
      requireLogin: true,
      role: "admin",
    })
    .when("/user-detail/:id", {
      templateUrl: "views/user-detail.html",
      controller: "UserDetailController",
      requireLogin: true,
      role: "admin",
    })
    .when("/about", {
      templateUrl: "views/about.html",
    })
    .otherwise({ redirectTo: "/login" });
});

app.run(function ($rootScope, $location) {
  $rootScope.$on("$routeChangeStart", function (event, next) {
    var userRole = localStorage.getItem("userRole");
    var isLoggedIn = localStorage.getItem("sessionToken");

    if (next.requireLogin && !isLoggedIn) {
      $location.path("/login");
    }

    if (next.role && next.role !== userRole) {
      alert("Access Denied: Only Admins can enter this page.");
      event.preventDefault();
      $location.path("/medicines");
    }
  });

  $rootScope.logout = function () {
    localStorage.clear();
    $location.path("/login");
  };
});

app.filter("startFrom", function () {
  return function (input, start) {
    if (!input || !input.length) {
      return;
    }
    start = +start;
    return input.slice(start);
  };
});
