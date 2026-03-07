app.controller("UsersController", function ($scope, UserService) {
  // 1. Initialize Variables
  $scope.users = [];
  $scope.currentUser = {};
  $scope.isEdit = false;
  $scope.loading = false;

  // Search & Filter state
  $scope.searchQuery = "";

  // Delete confirmation state
  $scope.deleteId = null;

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
      const emailExists = $scope.users.some(
        (u) => u.email.toLowerCase() === $scope.currentUser.email.toLowerCase(),
      );

      if (emailExists) {
        // Show custom modal instead of alert
        var duplicateModal = new bootstrap.Modal(
          document.getElementById("duplicateEmailModal"),
        );
        duplicateModal.show();
        return;
      }

      // Duplicate Phone Check (Only for NEW users)
      const phoneExists = $scope.users.some(
        (u) => u.phone === $scope.currentUser.phone,
      );

      if (phoneExists) {
        // Show custom modal for duplicate phone
        var duplicatePhoneModal = new bootstrap.Modal(
          document.getElementById("duplicatePhoneModal"),
        );
        duplicatePhoneModal.show();
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
          // Close the modal using Bootstrap API
          var userModal = bootstrap.Modal.getInstance(
            document.getElementById("userModal"),
          );
          if (userModal) {
            userModal.hide();
          }
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
        // Close the modal using Bootstrap API
        var userModal = bootstrap.Modal.getInstance(
          document.getElementById("userModal"),
        );
        if (userModal) {
          userModal.hide();
        }
      })
      .catch(function (error) {
        console.error("Error updating user", error);
      });
  };

  $scope.deleteUser = function (id) {
    $scope.deleteId = id;
    // Show the modal using Bootstrap's modal API
    var deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal"),
    );
    deleteModal.show();
  };

  $scope.confirmDelete = function () {
    if ($scope.deleteId) {
      UserService.deleteUser($scope.deleteId)
        .then(function (response) {
          console.log("User deleted successfully:", response);
          $scope.loadUsers();
          $scope.deleteId = null;
          // Hide the modal
          var deleteModal = bootstrap.Modal.getInstance(
            document.getElementById("deleteModal"),
          );
          if (deleteModal) {
            deleteModal.hide();
          }
        })
        .catch(function (error) {
          console.error("Error deleting user", error);
          alert("Error deleting user. Please try again.");
        });
    }
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
