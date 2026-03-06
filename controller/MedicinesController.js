app.controller(
  "MedicinesController",
  function ($scope, MedicineService, CategoryService, CartService) {
    // 1. Initialize Variables
    $scope.medicines = [];
    $scope.categories = [];
    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.loading = false;

    // Search & Filter state
    $scope.searchQuery = "";
    $scope.selectedCategory = "";

    // ================= CASHIER / CART LOGIC =================

    $scope.addToCart = function (medicine) {
      // Find if the item is already in the cart to check combined quantity
      var cartItem = CartService.getCart().find((i) => i.id === medicine.id);
      var currentInCart = cartItem ? cartItem.quantity : 0;

      if (currentInCart + 1 > medicine.stock) {
        alert("Not enough stock available! Remaining: " + medicine.stock);
        return;
      }

      CartService.addToCart(medicine);
    };

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
        var exists = $scope.categories.some(
          (c) => c.name.toLowerCase() === newCat.toLowerCase(),
        );

        if (exists) {
          alert("Category already exists!");
        } else {
          CategoryService.addCategory(newCat).then(function () {
            $scope.loadCategories();
            $scope.currentMed.category = newCat;
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
      if ($scope.currentMed.expiry_date) {
        $scope.currentMed.expiry_date = new Date($scope.currentMed.expiry_date);
      }
    };

    $scope.updateMedicine = function () {
      // We use a copy to ensure we don't send extra UI-only properties to Supabase
      var dataToSave = angular.copy($scope.currentMed);

      MedicineService.updateMedicine(dataToSave.id, dataToSave)
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
