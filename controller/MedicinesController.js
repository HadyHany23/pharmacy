app.controller(
  "MedicinesController",
  function ($scope, MedicineService, CategoryService, CartService) {
    // 1. Initialize Variables
    $scope.medicines = [];
    $scope.categories = [];
    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.loading = false;

    // UI Helpers
    $scope.addingNewCategory = false;
    $scope.tempCategoryName = "";
    $scope.searchQuery = "";
    $scope.selectedCategory = "";

    // SweetAlert Toast Helper
    const toast = (title, icon = "success") => {
      Swal.fire({
        title: title,
        icon: icon,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    };

    // ================= CASHIER / CART LOGIC =================

    $scope.addToCart = function (medicine) {
      // Check current cart state
      const cartItem = CartService.getCart().find((i) => i.id === medicine.id);
      const currentInCart = cartItem ? cartItem.quantity : 0;

      if (currentInCart + 1 > medicine.stock) {
        Swal.fire({
          title: "Stock Limit",
          text: "Only " + medicine.stock + " units available.",
          icon: "warning",
        });
        return;
      }

      CartService.addToCart(medicine);
      toast("Medicine added successfully"); // Requested success message
    };

    // ================= CATEGORY LOGIC =================

    $scope.loadCategories = function () {
      CategoryService.getCategories()
        .then((res) => ($scope.categories = res.data))
        .catch((err) => console.error("Category Load Error", err));
    };

    $scope.confirmInlineAddCategory = function () {
      if (!$scope.tempCategoryName) return;

      const exists = $scope.categories.some(
        (c) => c.name.toLowerCase() === $scope.tempCategoryName.toLowerCase(),
      );

      if (exists) {
        Swal.fire("Error", "Category already exists!", "warning");
      } else {
        CategoryService.addCategory($scope.tempCategoryName).then(() => {
          $scope.loadCategories();
          $scope.currentMed.category = $scope.tempCategoryName;
          $scope.addingNewCategory = false;
          $scope.tempCategoryName = "";
          toast("Category Created");
        });
      }
    };

    // ================= MEDICINE LOGIC =================

    $scope.loadMedicines = function () {
      $scope.loading = true;
      MedicineService.getMedicines()
        .then((res) => ($scope.medicines = res.data))
        .finally(() => ($scope.loading = false));
    };

    $scope.saveMedicine = function () {
      // Data cleaning: Ensure dates are strings for Supabase
      const dataToSave = angular.copy($scope.currentMed);

      if (!$scope.isEdit) {
        const exists = $scope.medicines.some(
          (m) => m.name.toLowerCase() === dataToSave.name.toLowerCase(),
        );
        if (exists) {
          Swal.fire("Duplicate Entry", "This medicine already exists.", "info");
          return;
        }

        MedicineService.createMedicine(dataToSave).then(() => {
          finishSave("Medicine created successfully!");
        });
      } else {
        MedicineService.updateMedicine(dataToSave.id, dataToSave).then(() => {
          finishSave("Medicine updated successfully!");
        });
      }
    };

    const finishSave = (msg) => {
      $scope.loadMedicines();
      $scope.resetForm();
      // Closes the Bootstrap modal programmatically if needed, or rely on data-bs-dismiss
      toast(msg);
    };

    $scope.editMedicine = function (medicine) {
      $scope.isEdit = true;
      $scope.currentMed = angular.copy(medicine);
      if ($scope.currentMed.expiry_date) {
        $scope.currentMed.expiry_date = new Date($scope.currentMed.expiry_date);
      }
    };

    $scope.deleteMedicine = function (id) {
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          MedicineService.deleteMedicine(id).then(() => {
            $scope.loadMedicines();
            toast("Medicine Deleted", "info");
          });
        }
      });
    };

    // ================= UTILS =================

    $scope.isExpired = function (dateStr) {
      if (!dateStr) return false;
      return new Date(dateStr) < new Date();
    };

    $scope.resetForm = function () {
      $scope.isEdit = false;
      $scope.currentMed = {};
      $scope.addingNewCategory = false;
      $scope.tempCategoryName = "";
    };

    // INITIAL LOAD
    $scope.loadMedicines();
    $scope.loadCategories();
  },
);
