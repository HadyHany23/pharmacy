app.controller("MainController", function ($scope, $location) {
  // This function is used by index.html to show/hide the Navbar
  $scope.isLoggedIn = function () {
    return localStorage.getItem("sessionToken") !== null;
  };

  // This function checks the role to change the interface
  $scope.getUserRole = function () {
    return localStorage.getItem("userRole");
  };

  $scope.logout = function () {
    localStorage.clear();
    $location.path("/login");
  };
});
