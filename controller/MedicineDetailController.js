app.controller(
  "MedicineDetailController",
  function ($scope, $routeParams, MedicineService, $location) {
    console.log("MedicineDetailController loaded");
    console.log("Route params:", $routeParams);

    $scope.medicine = null;
    $scope.loading = true;

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
      $location.path("/medicines");
      setTimeout(function () {
        angular.element("#medicineModal").modal("show");
        angular.element("#medicineModal").scope().editMedicine($scope.medicine);
      }, 100);
    };

    $scope.deleteMedicine = function () {
      if (confirm("Are you sure you want to delete this medicine?")) {
        MedicineService.deleteMedicine($scope.medicine.id)
          .then(function () {
            $location.path("/medicines");
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

    $scope.loadMedicine();
  },
);
