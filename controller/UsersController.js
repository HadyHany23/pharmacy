app.controller("UsersController", function ($scope, UserService) {
  // 1. Initialize Variables
  $scope.users = [];
  $scope.currentUser = {};
  $scope.isEdit = false;
  $scope.loading = false;

  // Search & Filter state
  $scope.searchQuery = "";

  // ================= USER LOGIC =================

  $scope.loadUsers = function () {
    $scope.loading = true;
    UserService.getUsers()
      .then(function (response) {
        $scope.users = response.data;
      })
      .catch(function (error) {
        console.error("Error loading users", error);
      })
      .finally(function () {
        $scope.loading = false;
      });
  };

  $scope.saveUser = function () {
    // Duplicate Email Check (Only for NEW users)
    if (!$scope.isEdit) {
      const exists = $scope.users.some(
        (u) => u.email.toLowerCase() === $scope.currentUser.email.toLowerCase(),
      );

      if (exists) {
        alert("This email is already in the system. Use 'Edit' instead.");
        return;
      }
    }

    if ($scope.isEdit) {
      $scope.updateUser();
    } else {
      UserService.createUser($scope.currentUser)
        .then(function (response) {
          console.log("User created successfully:", response);
          $scope.loadUsers();
          $scope.resetForm();
          // Close the modal
          angular.element("#userModal").modal("hide");
        })
        .catch(function (error) {
          console.error("Error creating user", error);
        });
    }
  };

  $scope.editUser = function (user) {
    $scope.isEdit = true;
    $scope.currentUser = angular.copy(user);
  };

  $scope.updateUser = function () {
    UserService.updateUser($scope.currentUser.id, $scope.currentUser)
      .then(function (response) {
        console.log("User updated successfully:", response);
        $scope.loadUsers();
        $scope.resetForm();
        // Close the modal
        angular.element("#userModal").modal("hide");
      })
      .catch(function (error) {
        console.error("Error updating user", error);
      });
  };

  $scope.deleteUser = function (id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    UserService.deleteUser(id)
      .then(function (response) {
        console.log("User deleted successfully:", response);
        $scope.loadUsers();
      })
      .catch(function (error) {
        console.error("Error deleting user", error);
        alert("Error deleting user. Please try again.");
      });
  };

  // ================= UTILS =================

  $scope.resetForm = function () {
    $scope.isEdit = false;
    $scope.currentUser = {};
  };

  $scope.cancelEdit = function () {
    $scope.resetForm();
  };

  // INITIAL LOAD
  $scope.loadUsers();
});
