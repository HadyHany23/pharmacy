app.controller(
  "CheckoutController",
  function ($scope, $location, CartService, $http, SB_CONFIG) {
    $scope.cart = CartService.getCart();
    $scope.totalAmount = CartService.getTotal();
    $scope.customer = { name: "", phone: "" };
    $scope.customerFound = false;
    $scope.processing = false;

    const HEADERS = { headers: SB_CONFIG.HEADERS() };

    // 1. Find Customer by Phone
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
          } else {
            alert("New customer detected. Please enter their name.");
            $scope.customerFound = false;
          }
        });
    };

    // 2. The Process Order Transaction
    $scope.processOrder = function () {
      if ($scope.cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      $scope.processing = true;

      // --- STEP A: RESOLVE CUSTOMER (The 409 Fix) ---
      let customerPromise;

      if ($scope.customerFound) {
        // We already have them from the findCustomer search
        customerPromise = Promise.resolve({ data: [$scope.customer] });
      } else {
        // Attempt to create a new customer
        customerPromise = $http
          .post(SB_CONFIG.URL + "customers", $scope.customer, {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          })
          .catch(function (err) {
            // If 409 happens, it means the phone number exists. Just fetch that user.
            if (err.status === 409) {
              return $http.get(
                SB_CONFIG.URL + "customers?phone=eq." + $scope.customer.phone,
                HEADERS,
              );
            }
            throw err; // Re-throw if it's a different error
          });
      }

      customerPromise
        .then(function (custRes) {
          if (!custRes.data || custRes.data.length === 0) {
            throw { data: { message: "Could not find or create customer." } };
          }

          const customerId = custRes.data[0].id;

          // Step B: Create the Order
          const orderData = {
            customer_id: customerId,
            total_price: parseFloat($scope.totalAmount),
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

          // Step C: Save Order Items
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
          // Step D: UPDATE MEDICINE STOCK
          const stockUpdates = $scope.cart.map((item) => {
            const newStock = item.stock - item.quantity;

            return $http.patch(
              SB_CONFIG.URL + "medicines?id=eq." + item.id,
              { stock: newStock },
              HEADERS,
            );
          });

          return Promise.all(stockUpdates);
        })
        .then(function () {
          alert("Sale Completed & Inventory Updated!");
          CartService.clearCart();
          $location.path("/medicines");
        })
        .catch((err) => {
          console.error("Transaction Error:", err);
          let msg = "Network Error";
          if (err.data) {
            msg =
              err.data.message ||
              err.data.error_description ||
              JSON.stringify(err.data);
          }
          alert("Checkout Failed: " + msg);
        })
        .finally(() => {
          $scope.processing = false;
        });
    };
  },
);
