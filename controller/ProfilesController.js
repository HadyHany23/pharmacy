app.controller(
  "ProfilesController",
  function ($scope, ProfilesService, RolesService) {
    // 1. Initialize Variables
    $scope.profiles = [];
    $scope.roles = [];
    $scope.currentProfile = {};
    $scope.isEdit = false;
    $scope.loading = false;

    // Search state
    $scope.searchQuery = "";

    // ================= ROLE LOGIC =================

    $scope.loadRoles = function () {
      RolesService.getRoles()
        .then(function (response) {
          $scope.roles = response.data;
        })
        .catch(function (err) {
          console.error("Failed to load roles", err);
        });
    };

    $scope.addNewRole = function () {
      var newRoleName = prompt("Enter new role name (e.g. Pharmacist):");
      if (newRoleName) {
        // Local duplicate check
        var exists = $scope.roles.some(
          (r) => r.name.toLowerCase() === newRoleName.toLowerCase(),
        );

        if (exists) {
          alert("Role already exists!");
        } else {
          RolesService.addRoles(newRoleName).then(function () {
            $scope.loadRoles(); // Refresh the dropdown
            alert("Role added successfully!");
          });
        }
      }
    };

    // ================= PROFILE LOGIC =================

    $scope.loadProfiles = function () {
      $scope.loading = true;
      ProfilesService.getProfile() // This fetches from your 'profiles' table
        .then(function (response) {
          $scope.profiles = response.data;
        })
        .catch(function (error) {
          console.error("Error loading profiles", error);
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.saveProfile = function () {
      // Duplicate Username Check (Only for NEW staff)
      if (!$scope.isEdit) {
        const exists = $scope.profiles.some(
          (p) =>
            p.username.toLowerCase() ===
            $scope.currentProfile.username.toLowerCase(),
        );

        if (exists) {
          alert("This username is already taken. Please choose another.");
          return;
        }
      }

      if ($scope.isEdit) {
        $scope.updateProfile();
      } else {
        ProfilesService.createProfile($scope.currentProfile).then(function () {
          $scope.loadProfiles();
          $scope.resetForm();
        });
      }
    };

    $scope.editProfile = function (profile) {
      $scope.isEdit = true;
      // Use angular.copy so changes don't show in the table until we save
      $scope.currentProfile = angular.copy(profile);
    };

    $scope.updateProfile = function () {
      // 1. Create a clean copy so we don't mess up the UI
      var dataToSave = angular.copy($scope.currentProfile);

      // 2. Remove the 'roles' object because Supabase can't save nested objects
      // back into the profiles table. It only wants the role_id!
      delete dataToSave.roles;

      // 3. Send the CLEAN data to the service
      ProfilesService.updateProfile(dataToSave.id, dataToSave)
        .then(function () {
          $scope.loadProfiles();
          $scope.resetForm();
          alert("Profile updated successfully!");
        })
        .catch(function (error) {
          console.error("Error updating profile", error);
          alert("Update failed. Check the console.");
        });
    };

    $scope.deleteProfile = function (id) {
      // Don't let the Admin delete themselves by mistake!
      if (!confirm("Are you sure you want to remove this staff member?"))
        return;

      ProfilesService.deleteProfile(id).then(function () {
        $scope.loadProfiles();
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
