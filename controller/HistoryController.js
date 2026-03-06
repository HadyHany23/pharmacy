app.controller("HistoryController", function ($scope, $http, SB_CONFIG) {
  $scope.orders = [];
  $scope.filteredOrders = [];
  $scope.loading = true;

  // Filter Models
  $scope.searchCustomer = "";
  $scope.startDate = null;
  $scope.endDate = null;
  $scope.sortReverse = true; // Default to Newest first

  const QUERY =
    "orders?select=*,customers(name,phone),order_items(*,medicines(name))&order=created_at.desc";

  $scope.loadHistory = function () {
    $scope.loading = true;
    $http
      .get(SB_CONFIG.URL + QUERY, { headers: SB_CONFIG.HEADERS() })
      .then(function (res) {
        $scope.orders = res.data;
      })
      .finally(function () {
        $scope.loading = false;
      });
  };

  // The Custom Date Filter Logic
  $scope.dateFilter = function (order) {
    if (!$scope.startDate && !$scope.endDate) return true;

    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0); // Normalize to start of day

    if ($scope.startDate && orderDate < new Date($scope.startDate))
      return false;
    if ($scope.endDate && orderDate > new Date($scope.endDate)) return false;

    return true;
  };

  $scope.resetFilters = function () {
    $scope.searchCustomer = "";
    $scope.startDate = null;
    $scope.endDate = null;
  };

  $scope.loadHistory();
});
