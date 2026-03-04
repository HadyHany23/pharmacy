var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/medicines", {
      templateUrl: "views/medicines.html",
      controller: "MedicinesController",
    })
    .when("/about", { templateUrl: "views/about.html" })
    .otherwise({ redirectTo: "/about" });
});
