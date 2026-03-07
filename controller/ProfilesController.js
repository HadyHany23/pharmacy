app.controller(
  "ProfilesController",
  function ($scope, ProfilesService, RolesService) {
    $scope.profiles = [];
    $scope.roles = [];
    $scope.currentProfile = {};
    $scope.isEdit = false;
    $scope.loading = false;

    $scope.searchQuery = "";

    // ================= ROLE LOGIC =================

    $scope.loadRoles = function () {
      RolesService.getRoles()
        .then(function (response) {
          $scope.roles = response.data;
        })
        .catch(function () {
          Swal.fire("Error", "Failed to load roles.", "error");
        });
    };

    $scope.newRoleName = "";
    $scope.roleError = "";

    $scope.confirmAddRole = function () {
      if (!$scope.newRoleName) {
        $scope.roleError = "Role name cannot be empty.";
        return;
      }

      var exists = $scope.roles.some(
        (r) => r.name.toLowerCase() === $scope.newRoleName.toLowerCase(),
      );

      if (exists) {
        $scope.roleError = "Role already exists!";
        return;
      }

      RolesService.addRoles($scope.newRoleName)
        .then(function () {
          $scope.loadRoles();
          $scope.newRoleName = "";
          $scope.roleError = "";

          var modal = bootstrap.Modal.getInstance(
            document.getElementById("roleModal"),
          );
          modal.hide();

          Swal.fire("Success", "Role added successfully!", "success");
        })
        .catch(function () {
          $scope.roleError = "Error adding role.";
        });
    };

    $scope.removeRole = function () {
      // 1. Initial check
      if (!$scope.currentProfile.role_id) {
        Swal.fire("Warning", "Please select a role first.", "warning");
        return;
      }

      // 2. SweetAlert Confirmation
      Swal.fire({
        title: "Delete Role?",
        text: "This action cannot be undone. Are you sure you want to delete this role?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // 3. Execute Deletion
          RolesService.deleteRole($scope.currentProfile.role_id)
            .then(function () {
              Swal.fire("Deleted", "Role deleted successfully!", "success");

              // Reset UI
              $scope.currentProfile.role_id = "";
              $scope.loadRoles();
            })
            .catch(function (err) {
              // 4. Specific Error Handling for Foreign Key Constraints
              if (
                err.status === 409 ||
                (err.data && err.data.code === "23503")
              ) {
                Swal.fire(
                  "Cannot Delete",
                  "This role is still assigned to one or more staff members. Change their roles before deleting this one.",
                  "error",
                );
              } else {
                Swal.fire(
                  "Error",
                  "Error deleting role: " +
                    (err.data ? err.data.message : "Unknown error"),
                  "error",
                );
              }
            });
        }
      });
    };

    // ================= PROFILE LOGIC =================

    $scope.loadProfiles = function () {
      $scope.loading = true;

      ProfilesService.getProfile()
        .then(function (response) {
          $scope.profiles = response.data;
        })
        .catch(function () {
          Swal.fire("Error", "Error loading staff profiles.", "error");
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.saveProfile = function () {
      if (!$scope.isEdit) {
        const exists = $scope.profiles.some(
          (p) =>
            p.username.toLowerCase() ===
            $scope.currentProfile.username.toLowerCase(),
        );

        if (exists) {
          Swal.fire(
            "Username Exists",
            "This username is already taken. Please choose another.",
            "warning",
          );
          return;
        }
      }

      if ($scope.isEdit) {
        $scope.updateProfile();
      } else {
        ProfilesService.createProfile($scope.currentProfile)
          .then(function () {
            $scope.loadProfiles();
            $scope.resetForm();

            Swal.fire(
              "Success",
              "Staff account created successfully!",
              "success",
            );
          })
          .catch(function () {
            Swal.fire("Error", "Failed to create staff account.", "error");
          });
      }
    };

    $scope.editProfile = function (profile) {
      $scope.isEdit = true;
      $scope.currentProfile = angular.copy(profile);
    };

    $scope.updateProfile = function () {
      var dataToSave = angular.copy($scope.currentProfile);

      delete dataToSave.roles;

      ProfilesService.updateProfile(dataToSave.id, dataToSave)
        .then(function () {
          $scope.loadProfiles();
          $scope.resetForm();

          Swal.fire("Success", "Profile updated successfully!", "success");
        })
        .catch(function () {
          Swal.fire("Error", "Update failed.", "error");
        });
    };

    $scope.deleteProfile = function (id) {
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to remove this staff member. This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete them!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        // result.isConfirmed is true only if the user clicked the delete button
        if (result.isConfirmed) {
          ProfilesService.deleteProfile(id)
            .then(function () {
              $scope.loadProfiles();
              Swal.fire("Deleted!", "Staff member removed.", "success");
            })
            .catch(function () {
              Swal.fire("Error", "Failed to delete staff member.", "error");
            });
        }
      });
    };

    // ================= UTILS =================

    $scope.resetForm = function () {
      $scope.isEdit = false;
      $scope.currentProfile = {};
    };

    $scope.cancelEdit = function () {
      $scope.resetForm();
    };

    // INITIAL LOAD

    $scope.loadProfiles();
    $scope.loadRoles();
  },
);
