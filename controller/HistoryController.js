app.controller(
  "HistoryController",
  function ($scope, $http, SB_CONFIG, $filter) {
    $scope.orders = [];
    $scope.loading = true;

    $scope.searchCustomer = "";
    $scope.startDate = null;
    $scope.endDate = null;
    $scope.sortReverse = true;

    $scope.currentPage = 0;
    $scope.pageSize = 10;

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

    $scope.customerFilter = function (order) {
      if (!$scope.searchCustomer) return true;

      const searchTerm = $scope.searchCustomer.toLowerCase();
      const name = (order.customers?.name || "").toLowerCase();
      const phone = (order.customers?.phone || "").toLowerCase();

      return name.includes(searchTerm) || phone.includes(searchTerm);
    };

    $scope.dateFilter = function (order) {
      if (!$scope.startDate && !$scope.endDate) return true;

      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      if ($scope.startDate) {
        const start = new Date($scope.startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }

      if ($scope.endDate) {
        const end = new Date($scope.endDate);
        end.setHours(0, 0, 0, 0);
        if (orderDate > end) return false;
      }

      return true;
    };

    $scope.numberOfPages = function () {
      let filtered = $filter("filter")($scope.orders, $scope.customerFilter);
      filtered = $filter("filter")(filtered, $scope.dateFilter);
      return Math.ceil(filtered.length / $scope.pageSize) || 1;
    };

    $scope.$watchGroup(
      ["searchCustomer", "startDate", "endDate", "pageSize"],
      function () {
        $scope.currentPage = 0;
      },
    );

    $scope.resetFilters = function () {
      $scope.searchCustomer = "";
      $scope.startDate = null;
      $scope.endDate = null;
      $scope.currentPage = 0;
    };

    $scope.loadHistory();
  },
);
