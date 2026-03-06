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
      requireLogin: true, // Door is locked
    })
    .when("/profiles", {
      templateUrl: "views/profiles.html",
      controller: "ProfilesController",
      requireLogin: true,
      role: "admin", // Only for the boss
    })
    .when("/cart", {
      templateUrl: "views/cart.html",
      controller: "CartController",
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
    .when("/about", {
      templateUrl: "views/about.html",
    })
    .otherwise({ redirectTo: "/login" }); // System starts here
});

// This block runs every time the URL changes
app.run(function ($rootScope, $location) {
  $rootScope.$on("$routeChangeStart", function (event, next) {
    var userRole = localStorage.getItem("userRole");
    var isLoggedIn = localStorage.getItem("sessionToken");

    // 1. If page requires login and you aren't logged in -> Go to login
    if (next.requireLogin && !isLoggedIn) {
      $location.path("/login");
    }

    // 2. If page is for Admin but you are a Cashier -> Go to medicines
    if (next.role && next.role !== userRole) {
      alert("Access Denied: Only Admins can enter this page.");
      $location.path("/medicines");
    }
  });
});
