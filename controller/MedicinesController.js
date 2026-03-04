app.controller(
  "MedicinesController",
  function ($scope, MedicineService, CategoryService) {
    // 1. Initialize Variables
    $scope.medicines = [];
    $scope.categories = [];
    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.loading = false;

    // Search & Filter state
    $scope.searchQuery = "";
    $scope.selectedCategory = "";

    // ================= CATEGORY LOGIC =================

    $scope.loadCategories = function () {
      CategoryService.getCategories()
        .then(function (response) {
          $scope.categories = response.data;
        })
        .catch(function (err) {
          console.error("Failed to load categories", err);
        });
    };

    $scope.addNewCategory = function () {
      var newCat = prompt("Enter new category name:");
      if (newCat) {
        // Check for duplicates locally first
        var exists = $scope.categories.some(
          (c) => c.name.toLowerCase() === newCat.toLowerCase(),
        );

        if (exists) {
          alert("Category already exists!");
        } else {
          CategoryService.addCategory(newCat).then(function () {
            $scope.loadCategories(); // Refresh the list
            $scope.currentMed.category = newCat; // Auto-select it
          });
        }
      }
    };

    // ================= MEDICINE LOGIC =================

    $scope.loadMedicines = function () {
      $scope.loading = true;
      MedicineService.getMedicines()
        .then(function (response) {
          $scope.medicines = response.data;
        })
        .catch(function (error) {
          console.error("Error loading medicines", error);
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.saveMedicine = function () {
      // Duplicate Name Check (Only for NEW medicines)
      if (!$scope.isEdit) {
        const exists = $scope.medicines.some(
          (m) => m.name.toLowerCase() === $scope.currentMed.name.toLowerCase(),
        );

        if (exists) {
          alert("This medicine is already in the system. Use 'Edit' instead.");
          return;
        }
      }

      if ($scope.isEdit) {
        $scope.updateMedicine();
      } else {
        MedicineService.createMedicine($scope.currentMed).then(function () {
          $scope.loadMedicines();
          $scope.resetForm();
        });
      }
    };

    $scope.editMedicine = function (medicine) {
      $scope.isEdit = true;
      $scope.currentMed = angular.copy(medicine);
      // Ensure the date is a real Date object so the HTML5 input can read it
      if ($scope.currentMed.expiry_date) {
        $scope.currentMed.expiry_date = new Date($scope.currentMed.expiry_date);
      }
    };

    $scope.updateMedicine = function () {
      MedicineService.updateMedicine($scope.currentMed.id, $scope.currentMed)
        .then(function () {
          $scope.loadMedicines();
          $scope.resetForm();
        })
        .catch(function (error) {
          console.error("Error updating medicine", error);
        });
    };

    $scope.deleteMedicine = function (id) {
      if (!confirm("Are you sure?")) return;
      MedicineService.deleteMedicine(id).then(function () {
        $scope.loadMedicines();
      });
    };

    // ================= UTILS =================

    $scope.isExpired = function (dateStr) {
      if (!dateStr) return false;
      const expiry = new Date(dateStr);
      const today = new Date();
      return expiry < today;
    };

    $scope.resetForm = function () {
      $scope.isEdit = false;
      $scope.currentMed = {};
    };

    $scope.cancelEdit = function () {
      $scope.resetForm();
    };

    // INITIAL LOAD
    $scope.loadMedicines();
    $scope.loadCategories();
  },
);
