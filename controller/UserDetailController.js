app.controller(
  "UserDetailController",
  function ($scope, $routeParams, UserService, $location) {
    console.log("UserDetailController loaded");
    console.log("Route params:", $routeParams);
    
    $scope.user = null;
    $scope.loading = true;

    $scope.loadUser = function () {
      console.log("Loading user with ID:", $routeParams.id);
      $scope.loading = true;
      UserService.getUserById($routeParams.id)
        .then(function (response) {
          console.log("Response from service:", response);
          if (response.data && response.data.length > 0) {
            $scope.user = response.data[0];
            console.log("User loaded:", $scope.user);
          } else {
            console.log("No user found");
            $scope.user = null;
          }
        })
        .catch(function (error) {
          console.error("Error loading user details", error);
          $scope.user = null;
        })
        .finally(function () {
          $scope.loading = false;
          console.log("Loading finished, user:", $scope.user);
        });
    };

    $scope.editUser = function () {
      $location.path('/users');
      setTimeout(function () {
        angular.element('#userModal').modal('show');
        angular.element('#userModal').scope().editUser($scope.user);
      }, 100);
    };

    $scope.deleteUser = function () {
      if (confirm("Are you sure you want to delete this user?")) {
        UserService.deleteUser($scope.user.id)
          .then(function () {
            $location.path('/users');
          })
          .catch(function (error) {
            console.error("Error deleting user", error);
            alert("Error deleting user. Please try again.");
          });
      }
    };

    $scope.sendEmail = function () {
      var emailSubject = encodeURIComponent("Regarding your account");
      var emailBody = encodeURIComponent(`Dear ${$scope.user.name},\n\nThis is a message from PharmaCare regarding your account.\n\nBest regards,\nPharmaCare Team`);
      window.location.href = `mailto:${$scope.user.email}?subject=${emailSubject}&body=${emailBody}`;
    };

    $scope.printProfile = function () {
      var profileContent = `
        PHARMACARE - User Profile
        ===========================
        Name: ${$scope.user.name}
        Email: ${$scope.user.email}
        Phone: ${$scope.user.phone || 'Not provided'}
        Address: ${$scope.user.address || 'Not provided'}
        Role: ${$scope.user.role || 'customer'}
        Status: ${$scope.user.status || 'active'}
        User ID: #${$scope.user.id}
        Date Added: ${new Date($scope.user.created_at).toLocaleDateString()}
        Last Updated: ${new Date($scope.user.updated_at).toLocaleDateString()}
      `;
      
      var printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>User Profile</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              h3 { color: #007bff; }
            </style>
          </head>
          <body>
            <pre>${profileContent}</pre>
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    $scope.loadUser();
  },
);
