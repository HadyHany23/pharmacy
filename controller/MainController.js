app.controller("MainController", function ($scope, $location) {
  $scope.isLoggedIn = function () {
    return localStorage.getItem("sessionToken") !== null;
  };

  $scope.getUserRole = function () {
    return localStorage.getItem("userRole");
  };

  $scope.logout = function () {
    localStorage.clear();
    $location.path("/login");
  };
});
