app.controller("AuthController", function ($scope, $location, AuthService) {
  $scope.loginData = {};
  $scope.regUser = {};
  $scope.roles = [];

  // Load roles for the registration dropdown
  AuthService.getRoles().then(function (res) {
    $scope.roles = res.data;
  });

  $scope.handleLogin = function () {
    AuthService.login(
      $scope.loginData.username,
      $scope.loginData.password,
    ).then(function (res) {
      if (res.data.length > 0) {
        const user = res.data[0];
        localStorage.setItem("userId", user.id);
        localStorage.setItem("sessionToken", "active");
        localStorage.setItem("userRole", user.roles.name);
        localStorage.setItem("userName", user.full_name);

        $location.path("/medicines");
      } else {
        alert("Wrong username or password!");
      }
    });
  };

  $scope.handleRegister = function () {
    AuthService.register($scope.regUser)
      .then(function () {
        alert("Success! Now you can login.");
        $location.path("/login");
      })
      .catch(function (err) {
        if (err.status === 409) {
          alert("Registration Error: This username is already taken!");
        } else {
          alert("An error occurred during registration.");
        }
      });
  };
});
