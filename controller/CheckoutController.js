app.controller(
  "CheckoutController",
  function ($scope, $location, CartService, $http, SB_CONFIG) {
    $scope.cart = CartService.getCart();
    $scope.totalAmount = CartService.getTotal();
    $scope.customer = { name: "", phone: "", email: "", address: "" };
    $scope.customerFound = false;
    $scope.processing = false;

    const HEADERS = { headers: SB_CONFIG.HEADERS() };

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

    // 1. Find Customer
    $scope.findCustomer = function () {
      if (!$scope.customer.phone) return;

      $http
        .get(
          SB_CONFIG.URL + "customers?phone=eq." + $scope.customer.phone,
          HEADERS,
        )
        .then(function (res) {
          if (res.data.length > 0) {
            $scope.customer = res.data[0];
            $scope.customerFound = true;

            // NEW: Track which fields were originally empty
            // If a field is empty, we allow editing. If it has data, we lock it.
            $scope.canEditName = !$scope.customer.name;
            $scope.canEditEmail = !$scope.customer.email;
            $scope.canEditAddress = !$scope.customer.address;

            toast("Customer Found: " + $scope.customer.name);
          } else {
            $scope.customerFound = false;
            // New customer: everything is editable
            const phone = $scope.customer.phone;
            $scope.customer = {
              name: "",
              phone: phone,
              email: "",
              address: "",
            };
            $scope.canEditName =
              $scope.canEditEmail =
              $scope.canEditAddress =
                true;
            Swal.fire("New Customer", "Please enter details.", "info");
          }
        });
    };

    // 2. Process Order
    $scope.processOrder = function () {
      if ($scope.cart.length === 0) return;
      $scope.processing = true;

      let customerPromise;

      // Create a clean object for Customer Save/Update
      // This ensures we only send fields that exist in your 'customers' table
      const customerData = {
        name: $scope.customer.name,
        phone: $scope.customer.phone,
        email: $scope.customer.email || null,
        address: $scope.customer.address || null,
      };

      if ($scope.customerFound && $scope.customer.id) {
        // UPDATE existing customer
        customerPromise = $http.patch(
          SB_CONFIG.URL + "customers?id=eq." + $scope.customer.id,
          customerData,
          {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          },
        );
      } else {
        // CREATE new customer
        customerPromise = $http
          .post(SB_CONFIG.URL + "customers", customerData, {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          })
          .catch((err) => {
            if (err.status === 409) {
              return $http.get(
                SB_CONFIG.URL + "customers?phone=eq." + $scope.customer.phone,
                HEADERS,
              );
            }
            throw err;
          });
      }

      customerPromise
        .then(function (custRes) {
          // Ensure we got a valid ID back
          const customerId = custRes.data[0].id;

          // STEP B: Create Order - ONLY send what the table needs
          const orderData = {
            customer_id: customerId,
            total_price: parseFloat($scope.totalAmount),
            // Only include 'notes' if you actually have that column in Supabase!
            // notes: $scope.orderNotes || ""
          };

          return $http.post(SB_CONFIG.URL + "orders", orderData, {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          });
        })
        .then(function (orderRes) {
          const orderId = orderRes.data[0].id;

          // STEP C: Save Items
          const itemsToSave = $scope.cart.map((item) => ({
            order_id: orderId,
            medicine_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
          }));

          return $http.post(
            SB_CONFIG.URL + "order_items",
            itemsToSave,
            HEADERS,
          );
        })
        .then(function () {
          // STEP D: Update Stock
          const stockUpdates = $scope.cart.map((item) => {
            return $http.patch(
              SB_CONFIG.URL + "medicines?id=eq." + item.id,
              {
                stock: item.stock - item.quantity,
              },
              HEADERS,
            );
          });
          return Promise.all(stockUpdates);
        })
        .then(function () {
          Swal.fire("Success!", "Sale Completed!", "success");
          CartService.clearCart();
          $location.path("/medicines");
        })
        .catch((err) => {
          console.error("FULL ERROR DETAIL:", err);
          let errorDetail = err.data
            ? err.data.message || err.data.details
            : "Check console";
          Swal.fire(
            "Error 400",
            "Database rejected the data: " + errorDetail,
            "error",
          );
        })
        .finally(() => ($scope.processing = false));
    };
  },
);
