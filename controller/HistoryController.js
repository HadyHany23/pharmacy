app.controller(
  "HistoryController",
  function ($scope, $http, SB_CONFIG, $filter) {
    $scope.orders = [];
    $scope.loading = true;

    // Search & Filter state
    $scope.searchCustomer = "";
    $scope.startDate = null;
    $scope.endDate = null;
    $scope.sortReverse = true;

    // --- ADDED PAGINATION VARIABLES ---
    $scope.currentPage = 0;
    $scope.pageSize = 10; // Default to 10 for history

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

    // --- ADDED PAGINATION LOGIC ---
    $scope.numberOfPages = function () {
      // We apply the same filters used in the table to get the correct count
      let filtered = $filter("filter")($scope.orders, $scope.customerFilter);
      filtered = $filter("filter")(filtered, $scope.dateFilter);

      return Math.ceil(filtered.length / $scope.pageSize) || 1;
    };

    // Reset page to 0 when filters change
    $scope.$watchGroup(
      ["searchCustomer", "startDate", "endDate", "pageSize"],
      function () {
        $scope.currentPage = 0;
      },
    );

    // ... (Keep your dateFilter and customerFilter functions exactly as they are) ...

    $scope.resetFilters = function () {
      $scope.searchCustomer = "";
      $scope.startDate = null;
      $scope.endDate = null;
      $scope.currentPage = 0;
    };

    $scope.loadHistory();
  },
);
