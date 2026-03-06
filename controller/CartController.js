app.controller("CartController", function ($scope, $location, CartService) {
  $scope.cart = CartService.getCart();

  $scope.increment = function (item) {
    if (item.quantity < item.stock) {
      item.quantity++;
    } else {
      alert("Cannot exceed available stock!");
    }
  };

  $scope.decrement = function (item) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  };

  $scope.remove = function (index) {
    CartService.removeItem(index);
  };

  $scope.getTotal = function () {
    return CartService.getTotal();
  };

  $scope.goToCheckout = function () {
    if ($scope.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    $location.path("/checkout");
  };
});
