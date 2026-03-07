app.controller("UsersController", function ($scope, UserService) {
  $scope.users = [];
  $scope.currentUser = {};
  $scope.isEdit = false;
  $scope.loading = false;
  $scope.searchQuery = "";
  $scope.deleteId = null;
  $scope.sortColumn = "name";
  $scope.sortReverse = false;

  // ================= SORTING LOGIC =================
  $scope.sortData = function (column) {
    if ($scope.sortColumn === column) {
      $scope.sortReverse = !$scope.sortReverse;
    } else {
      $scope.sortColumn = column;
      $scope.sortReverse = false;
    }
  };

  $scope.getSortClass = function (column) {
    if ($scope.sortColumn === column) {
      return $scope.sortReverse ? "bi-arrow-down" : "bi-arrow-up";
    }
    return "bi-arrow-down-up";
  };

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
    if (!$scope.isEdit) {
      const emailExists = $scope.users.some(
        (u) =>
          u.email &&
          $scope.currentUser.email &&
          u.email.toLowerCase() === $scope.currentUser.email.toLowerCase(),
      );

      if (emailExists) {
        var duplicateModal = new bootstrap.Modal(
          document.getElementById("duplicateEmailModal"),
        );
        duplicateModal.show();
        return;
      }

      const phoneExists = $scope.users.some(
        (u) =>
          u.phone &&
          $scope.currentUser.phone &&
          u.phone === $scope.currentUser.phone,
      );

      if (phoneExists) {
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

  $scope.resetForm = function () {
    $scope.isEdit = false;
    $scope.currentUser = {};
  };

  $scope.cancelEdit = function () {
    $scope.resetForm();
  };

  $scope.loadUsers();
});
