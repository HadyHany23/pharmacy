var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    // --- AUTHENTICATION ---
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "AuthController", // Keep your controller
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "AuthController",
    })

    // --- MEDICINES (INVENTORY) ---
    .when("/medicines", {
      templateUrl: "views/medicines.html",
      controller: "MedicinesController",
      requireLogin: true,
    })
    .when("/medicine-detail/:id", {
      // NEW FROM TEAMMATE
      templateUrl: "views/medicines-detail.html",
      controller: "MedicineDetailController",
      requireLogin: true,
    })

    // --- CART & CHECKOUT ---
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

    // --- USER & PROFILE MANAGEMENT ---
    .when("/profiles", {
      // Your staff profiles
      templateUrl: "views/profiles.html",
      controller: "ProfilesController",
      requireLogin: true,
      role: "admin",
    })
    .when("/users", {
      // New from teammate
      templateUrl: "views/user.html",
      controller: "UsersController",
      requireLogin: true,
      role: "admin",
    })
    .when("/user-detail/:id", {
      // New from teammate
      templateUrl: "views/user-detail.html",
      controller: "UserDetailController",
      requireLogin: true,
      role: "admin",
    })

    // --- GENERAL ---
    .when("/about", {
      templateUrl: "views/about.html",
    })
    .otherwise({ redirectTo: "/login" }); // Default to login for security
});

// --- THE SECURITY ENGINE ---
app.run(function ($rootScope, $location) {
  // We keep your route protection logic as it is the most secure
  $rootScope.$on("$routeChangeStart", function (event, next) {
    var userRole = localStorage.getItem("userRole");
    var isLoggedIn = localStorage.getItem("sessionToken");

    // 1. Protect private pages
    if (next.requireLogin && !isLoggedIn) {
      $location.path("/login");
    }

    // 2. Protect Admin-only pages
    if (next.role && next.role !== userRole) {
      alert("Access Denied: Only Admins can enter this page.");
      event.preventDefault(); // Stop the transition
      $location.path("/medicines");
    }
  });

  // Keep your teammate's global logout helper but use your storage logic
  $rootScope.logout = function () {
    localStorage.clear(); // Clears everything: token, role, name, id
    $location.path("/login");
  };
});

app.filter("startFrom", function () {
  return function (input, start) {
    if (!input || !input.length) {
      return;
    }
    start = +start; // parse to int
    return input.slice(start);
  };
});
