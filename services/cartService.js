app.service("CartService", function () {
  var cart = [];

  this.getCart = function () {
    return cart;
  };

  this.addToCart = function (product) {
    
    var existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock, 
        quantity: 1,
      });
    }
  };

  this.removeItem = function (index) {
    cart.splice(index, 1);
  };

  this.clearCart = function () {
    cart = [];
  };

  this.getTotal = function () {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
});
