app.controller(
  "MedicinesController",
  function ($scope, MedicineService, CategoryService, CartService) {
    $scope.medicines = [];
    $scope.categories = [];
    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.loading = false;

    $scope.searchQuery = "";
    $scope.selectedCategory = "";

    $scope.sortColumn = "";
    $scope.sortReverse = false;

    $scope.deleteId = null;

    $scope.newCategoryName = "";
    $scope.categoryError = "";

    $scope.currentPage = 0;
    $scope.pageSize = 5;

    $scope.numberOfPages = function () {
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

    $scope.$watchGroup(["searchQuery", "selectedCategory"], function () {
      $scope.currentPage = 0;
    });

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

    $scope.addToCart = function (medicine) {
      var cartItem = CartService.getCart().find((i) => i.id === medicine.id);
      var currentInCart = cartItem ? cartItem.quantity : 0;

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

      CartService.addToCart(medicine);

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
      var categoryModal = new bootstrap.Modal(
        document.getElementById("categoryModal"),
      );
      categoryModal.show();
    };

    $scope.removeCategory = function () {
      const selectedName = $scope.currentMed.category;
      const categoryObj = $scope.categories.find(
        (c) => c.name === selectedName,
      );

      if (!categoryObj) {
        Swal.fire(
          "Error",
          "Please select a category from the list to delete it.",
          "error",
        );
        return;
      }

      Swal.fire({
        title: "Delete Category?",
        text: `Are you sure you want to remove "${categoryObj.name}"? This will not delete medicines, but the category will disappear from filters.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          CategoryService.deleteCategory(categoryObj.id)
            .then(function () {
              Swal.fire("Deleted!", "Category has been removed.", "success");

              $scope.currentMed.category = ""; // Clear selection
              $scope.loadCategories(); // Reload dropdown list
            })
            .catch(function (err) {
              console.error("Delete failed", err);
              Swal.fire(
                "Error",
                "Delete failed. Check your permissions (401 Unauthorized).",
                "error",
              );
            });
        }
      });
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
          var categoryModal = bootstrap.Modal.getInstance(
            document.getElementById("categoryModal"),
          );
          if (categoryModal) {
            categoryModal.hide();
          }
        });
      }
    };

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
          var deleteModal = bootstrap.Modal.getInstance(
            document.getElementById("deleteModal"),
          );
          if (deleteModal) {
            deleteModal.hide();
          }
        });
      }
    };

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

    $scope.loadMedicines();
    $scope.loadCategories();
  },
);
