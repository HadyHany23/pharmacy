app.controller(
  "MedicineDetailController",
  function ($scope, $routeParams, MedicineService, $location) {
    $scope.medicine = null;
    $scope.loading = true;
    $scope.deleteId = null;

    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.categories = [];
    $scope.newCategoryName = "";
    $scope.categoryError = "";

    $scope.loadMedicine = function () {
      $scope.loading = true;
      MedicineService.getMedicineById($routeParams.id)
        .then(function (response) {
          if (response.data && response.data.length > 0) {
            $scope.medicine = response.data[0];
          } else {
            $scope.medicine = null;
            Swal.fire(
              "Not Found",
              "Medicine record could not be located.",
              "warning",
            );
          }
        })
        .catch(function (error) {
          Swal.fire("Error", "Failed to load medicine details.", "error");
          $scope.medicine = null;
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.isExpired = function (dateStr) {
      if (!dateStr) return false;
      const expiry = new Date(dateStr);
      const today = new Date();
      return expiry < today;
    };

    $scope.editMedicine = function () {
      $scope.isEdit = true;
      $scope.currentMed = angular.copy($scope.medicine);
      if ($scope.currentMed.expiry_date) {
        $scope.currentMed.expiry_date = new Date($scope.currentMed.expiry_date);
      }
      var medicineModal = new bootstrap.Modal(
        document.getElementById("medicineModal"),
      );
      medicineModal.show();
    };

    $scope.deleteMedicine = function () {
      Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete " + $scope.medicine.name,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          $scope.confirmDelete($scope.medicine.id);
        }
      });
    };

    $scope.confirmDelete = function (id) {
      MedicineService.deleteMedicine(id)
        .then(function () {
          Swal.fire("Deleted!", "Medicine has been removed.", "success");
          $location.path("/medicines");
        })
        .catch(function (error) {
          Swal.fire(
            "Error",
            "Could not delete the medicine. Please try again.",
            "error",
          );
        });
    };

    $scope.restockMedicine = function () {
      Swal.fire({
        title: "Restock Medicine",
        text: "How many units would you like to add?",
        input: "number",
        inputAttributes: {
          min: 1,
          step: 1,
        },
        inputValue: 10,
        showCancelButton: true,
        confirmButtonText: "Add Stock",
        showLoaderOnConfirm: true,
      }).then((result) => {
        if (result.isConfirmed && result.value > 0) {
          var addStock = parseInt(result.value);
          var updatedMedicine = angular.copy($scope.medicine);
          updatedMedicine.stock = parseInt(updatedMedicine.stock) + addStock;

          MedicineService.updateMedicine($scope.medicine.id, updatedMedicine)
            .then(function () {
              Swal.fire(
                "Success",
                addStock + " units added to stock.",
                "success",
              );
              $scope.loadMedicine();
            })
            .catch(function (error) {
              Swal.fire("Error", "Failed to update stock levels.", "error");
            });
        }
      });
    };

    $scope.printLabel = function () {
      var labelContent = `
      PHARMACARE - Medicine Label
      ============================
      Name: ${$scope.medicine.name}
      Category: ${$scope.medicine.category}
      Price: $${$scope.medicine.price}
      Stock: ${$scope.medicine.stock} units
      Expiry: ${new Date($scope.medicine.expiry_date).toLocaleDateString()}
      ID: #${$scope.medicine.id}
    `;

      var printWindow = window.open("", "_blank");
      printWindow.document.write(`
      <html>
        <head>
          <title>Medicine Label</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h3 { color: #007bff; }
          </style>
        </head>
        <body>
          <pre>${labelContent}</pre>
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </body>
      </html>
    `);
      printWindow.document.close();
    };

    $scope.loadCategories = function () {
      $scope.categories = [
        { name: "Antibiotics" },
        { name: "Pain Killers" },
        { name: "Vitamins" },
        { name: "Cold & Flu" },
        { name: "Allergy" },
      ];
    };

    $scope.addNewCategory = function () {
      $scope.newCategoryName = "";
      $scope.categoryError = "";
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
        $scope.categories.push({ name: newCat });
        $scope.currentMed.category = newCat;
        $scope.newCategoryName = "";
        $scope.categoryError = "";
        var categoryModal = bootstrap.Modal.getInstance(
          document.getElementById("categoryModal"),
        );
        if (categoryModal) {
          categoryModal.hide();
        }
        Swal.fire(
          "Success",
          "New category '" + newCat + "' added locally.",
          "success",
        );
      }
    };

    $scope.removeCategory = function () {
      const selectedName = $scope.currentMed.category;

      if (!selectedName) return;

      Swal.fire({
        title: "Delete Category?",
        text: `Are you sure you want to remove "${selectedName}"? This will only remove it from the list.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          $scope.categories = $scope.categories.filter(
            (c) => c.name !== selectedName,
          );
          $scope.currentMed.category = "";
          $scope.$apply();
          Swal.fire("Deleted!", "Category removed from the list.", "success");
        }
      });
    };

    $scope.saveMedicine = function () {
      if ($scope.isEdit) {
        $scope.updateMedicine();
      }
    };

    $scope.updateMedicine = function () {
      MedicineService.updateMedicine($scope.currentMed.id, $scope.currentMed)
        .then(function () {
          Swal.fire(
            "Updated",
            "Medicine details saved successfully.",
            "success",
          );
          $scope.loadMedicine();
          $scope.resetForm();
          var medicineModal = bootstrap.Modal.getInstance(
            document.getElementById("medicineModal"),
          );
          if (medicineModal) {
            medicineModal.hide();
          }
        })
        .catch(function (error) {
          Swal.fire(
            "Update Failed",
            "Error saving changes to the database.",
            "error",
          );
        });
    };

    $scope.resetForm = function () {
      $scope.isEdit = false;
      $scope.currentMed = {};
    };

    $scope.loadCategories();
    $scope.loadMedicine();
  },
);
