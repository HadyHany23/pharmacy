app.controller("AuthController", function ($scope, $location, AuthService) {
  $scope.loginData = {};
  $scope.regUser = {};
  $scope.roles = [];
  $scope.loading = false;

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

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

        Toast.fire({
          icon: "success",
          title: "Welcome back, " + user.full_name + "!",
        });

        $location.path("/medicines");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Wrong username or password!",
          confirmButtonColor: "#3085d6",
        });
      }
    });
  };

  $scope.handleRegister = function () {
    if ($scope.regForm.$invalid) return;

    $scope.loading = true;

    let userData = angular.copy($scope.regUser);

    delete userData.confirm_password;

    AuthService.register(userData)
      .then(function () {
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "Registration successful. You can now log in.",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#28a745",
        }).then(() => {
          $location.path("/login");
        });
      })
      .catch(function (err) {
        if (err.status === 409) {
          Swal.fire({
            icon: "warning",
            title: "Username Taken",
            text: "This username is already registered.",
            confirmButtonColor: "#f8bb86",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Error",
            text: "Could not create account.",
            footer: "Error: " + (err.data ? err.data.message : err.status),
          });
        }
      })
      .finally(function () {
        $scope.loading = false;
      });
  };
});
