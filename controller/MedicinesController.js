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

    // Sorting state
    $scope.sortColumn = "";
    $scope.sortReverse = false;

    // Delete confirmation state
    $scope.deleteId = null;

    // Category modal state
    $scope.newCategoryName = "";
    $scope.categoryError = "";

    // Pagination Variables
    $scope.currentPage = 0;
    $scope.pageSize = 5;

    // Function to calculate total pages (needed for the buttons)
    $scope.numberOfPages = function () {
      // We filter the medicines first so the page count is correct when searching
      let filtered = $scope.medicines.filter((med) => {
        let matchesSearch =
          !$scope.searchQuery ||
          med.name.toLowerCase().includes($scope.searchQuery.toLowerCase());
        let matchesCat =
          !$scope.selectedCategory || med.category === $scope.selectedCategory;
        return matchesSearch && matchesCat;
      });
      return Math.ceil(filtered.length / $scope.pageSize);
    };

    // Reset to page 0 when searching or changing category
    $scope.$watchGroup(["searchQuery", "selectedCategory"], function () {
      $scope.currentPage = 0;
    });

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
      return "bi-arrow-down-up"; // Default two-way arrow icon
    };

    // ================= CASHIER / CART LOGIC =================

    $scope.addToCart = function (medicine) {
      // Find if the item is already in the cart to check combined quantity
      var cartItem = CartService.getCart().find((i) => i.id === medicine.id);
      var currentInCart = cartItem ? cartItem.quantity : 0;

      // 1. Check Stock
      if (currentInCart + 1 > medicine.stock) {
        Swal.fire({
          title: "Out of Stock",
          text:
            "You cannot add more than " +
            medicine.stock +
            " units of this item.",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // 2. Add to Cart
      CartService.addToCart(medicine);

      // 3. Success Toast (Top-Right corner)
      Swal.fire({
        title: "Added Successfully!",
        text: medicine.name + " added to your cart.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
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
      $scope.newCategoryName = "";
      $scope.categoryError = "";
      // Show the modal using Bootstrap's modal API
      var categoryModal = new bootstrap.Modal(
        document.getElementById("categoryModal"),
      );
      categoryModal.show();
    };

    $scope.confirmAddCategory = function () {
      if (!$scope.newCategoryName || $scope.newCategoryName.trim() === "") {
        $scope.categoryError = "Please enter a category name";
        return;
      }

      var newCat = $scope.newCategoryName.trim();
      var exists = $scope.categories.some(
        (c) => c.name.toLowerCase() === newCat.toLowerCase(),
      );

      if (exists) {
        $scope.categoryError = "Category already exists!";
      } else {
        CategoryService.addCategory(newCat).then(function () {
          $scope.loadCategories();
          $scope.currentMed.category = newCat;
          $scope.newCategoryName = "";
          $scope.categoryError = "";
          // Hide the modal
          var categoryModal = bootstrap.Modal.getInstance(
            document.getElementById("categoryModal"),
          );
          if (categoryModal) {
            categoryModal.hide();
          }
        });
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
      $scope.deleteId = id;
      // Show the modal using Bootstrap's modal API
      var deleteModal = new bootstrap.Modal(
        document.getElementById("deleteModal"),
      );
      deleteModal.show();
    };

    $scope.confirmDelete = function () {
      if ($scope.deleteId) {
        MedicineService.deleteMedicine($scope.deleteId).then(function () {
          $scope.loadMedicines();
          $scope.deleteId = null;
          // Hide the modal
          var deleteModal = bootstrap.Modal.getInstance(
            document.getElementById("deleteModal"),
          );
          if (deleteModal) {
            deleteModal.hide();
          }
        });
      }
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
