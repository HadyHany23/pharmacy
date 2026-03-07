app.controller(
  "MedicineDetailController",
  function ($scope, $routeParams, MedicineService, $location) {
    console.log("MedicineDetailController loaded");
    console.log("Route params:", $routeParams);

    $scope.medicine = null;
    $scope.loading = true;
    $scope.deleteId = null;

    // Medicine form variables
    $scope.currentMed = {};
    $scope.isEdit = false;
    $scope.categories = [];
    $scope.newCategoryName = "";
    $scope.categoryError = "";

    $scope.loadMedicine = function () {
      console.log("Loading medicine with ID:", $routeParams.id);
      $scope.loading = true;
      MedicineService.getMedicineById($routeParams.id)
        .then(function (response) {
          console.log("Response from service:", response);
          if (response.data && response.data.length > 0) {
            $scope.medicine = response.data[0];
            console.log("Medicine loaded:", $scope.medicine);
          } else {
            console.log("No medicine found");
            $scope.medicine = null;
          }
        })
        .catch(function (error) {
          console.error("Error loading medicine details", error);
          $scope.medicine = null;
        })
        .finally(function () {
          $scope.loading = false;
          console.log("Loading finished, medicine:", $scope.medicine);
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
      // Show the modal using Bootstrap's modal API
      var medicineModal = new bootstrap.Modal(
        document.getElementById("medicineModal"),
      );
      medicineModal.show();
    };

    $scope.deleteMedicine = function () {
      $scope.deleteId = $scope.medicine.id;
      // Show the modal using Bootstrap's modal API
      var deleteModal = new bootstrap.Modal(
        document.getElementById("deleteModal"),
      );
      deleteModal.show();
    };

    $scope.confirmDelete = function () {
      if ($scope.deleteId) {
        MedicineService.deleteMedicine($scope.deleteId)
          .then(function () {
            $location.path("/medicines");
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
            console.error("Error deleting medicine", error);
            alert("Error deleting medicine. Please try again.");
          });
      }
    };

    $scope.restockMedicine = function () {
      var addStock = prompt(
        "How many units would you like to add to the stock?",
        "10",
      );
      if (addStock && !isNaN(addStock) && parseInt(addStock) > 0) {
        var updatedMedicine = angular.copy($scope.medicine);
        updatedMedicine.stock =
          parseInt(updatedMedicine.stock) + parseInt(addStock);

        MedicineService.updateMedicine($scope.medicine.id, updatedMedicine)
          .then(function () {
            $scope.loadMedicine();
          })
          .catch(function (error) {
            console.error("Error updating stock", error);
            alert("Error updating stock. Please try again.");
          });
      }
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

    // ================= MEDICINE FORM FUNCTIONS =================

    $scope.loadCategories = function () {
      // Import CategoryService and use it here
      // For now, we'll use a basic approach
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
        $scope.categories.push({ name: newCat });
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
      }
    };

    $scope.saveMedicine = function () {
      if ($scope.isEdit) {
        $scope.updateMedicine();
      }
    };

    $scope.updateMedicine = function () {
      MedicineService.updateMedicine($scope.currentMed.id, $scope.currentMed)
        .then(function () {
          $scope.loadMedicine();
          $scope.resetForm();
          // Hide the modal
          var medicineModal = bootstrap.Modal.getInstance(
            document.getElementById("medicineModal"),
          );
          if (medicineModal) {
            medicineModal.hide();
          }
        })
        .catch(function (error) {
          console.error("Error updating medicine", error);
        });
    };

    $scope.resetForm = function () {
      $scope.isEdit = false;
      $scope.currentMed = {};
    };

    // Initialize categories
    $scope.loadCategories();
    $scope.loadMedicine();
  },
);
