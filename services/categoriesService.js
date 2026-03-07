app.service("CategoryService", function ($http, SB_CONFIG) {
  const URL = SB_CONFIG.URL + "categories";
  const config = { headers: SB_CONFIG.HEADERS() };

  this.getCategories = function () {
    return $http.get(URL + "?select=*", config);
  };

  this.addCategory = function (categoryName) {
    return $http.post(URL, { name: categoryName }, config);
  };

  this.deleteCategory = function (categoryId) {
    return $http.delete(URL + "?id=eq." + categoryId, config);
  };
});
