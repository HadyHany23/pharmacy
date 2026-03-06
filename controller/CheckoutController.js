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

      // Step A: Save or Resolve Customer
      let customerPromise = $scope.customerFound
        ? Promise.resolve({ data: [$scope.customer] })
        : $http.post(SB_CONFIG.URL + "customers", $scope.customer, {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          });

      customerPromise
        .then(function (custRes) {
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
          // We create an array of "Update" promises for every item in the cart
          const stockUpdates = $scope.cart.map((item) => {
            const newStock = item.stock - item.quantity;

            return $http.patch(
              SB_CONFIG.URL + "medicines?id=eq." + item.id,
              { stock: newStock },
              HEADERS,
            );
          });

          // Wait for ALL stock updates to finish before moving on
          return Promise.all(stockUpdates);
        })
        .then(function () {
          alert("Sale Completed & Inventory Updated!");
          CartService.clearCart();
          $location.path("/medicines");
        })
        .catch((err) => {
          console.error("Transaction Error:", err);
          alert(
            "Checkout Failed: " +
              (err.data ? err.data.message : "Network Error"),
          );
        })
        .finally(() => {
          $scope.processing = false;
        });
    };
  },
);
