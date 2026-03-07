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

            $scope.canEditName = !$scope.customer.name;
            $scope.canEditEmail = !$scope.customer.email;
            $scope.canEditAddress = !$scope.customer.address;

            toast("Customer Found: " + $scope.customer.name);
          } else {
            $scope.customerFound = false;
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

    $scope.processOrder = function () {
      if ($scope.cart.length === 0) return;
      $scope.processing = true;

      const customerData = {
        name: $scope.customer.name,
        phone: $scope.customer.phone,
        email: $scope.customer.email || null,
        address: $scope.customer.address || null,
      };

      let resolveCustomer;

      if ($scope.customerFound && $scope.customer.id) {
        resolveCustomer = $http.patch(
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
        resolveCustomer = $http
          .post(SB_CONFIG.URL + "customers", customerData, {
            headers: {
              ...SB_CONFIG.HEADERS(),
              Prefer: "return=representation",
            },
          })
          .catch((err) => {
            if (err.status === 409) {
              return $http
                .get(
                  SB_CONFIG.URL + "customers?phone=eq." + $scope.customer.phone,
                  HEADERS,
                )
                .then((res) => {
                  const existingId = res.data[0].id;
                  return $http.patch(
                    SB_CONFIG.URL + "customers?id=eq." + existingId,
                    customerData,
                    {
                      headers: {
                        ...SB_CONFIG.HEADERS(),
                        Prefer: "return=representation",
                      },
                    },
                  );
                });
            }
            throw err;
          });
      }

      resolveCustomer
        .then(function (custRes) {
          const customer = custRes.data[0] || custRes.data;
          const customerId = customer.id;

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
          const stockUpdates = $scope.cart.map((item) => {
            return $http.patch(
              SB_CONFIG.URL + "medicines?id=eq." + item.id,
              { stock: item.stock - item.quantity },
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
          console.error("FULL ERROR:", err);
          let detail = err.data
            ? err.data.message || err.data.details
            : "Connection error";
          Swal.fire("Error", "Transaction failed: " + detail, "error");
        })
        .finally(() => ($scope.processing = false));
    };
  },
);
