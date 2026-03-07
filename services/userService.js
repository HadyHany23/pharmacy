app.service("UserService", function ($http, SB_CONFIG) {
  const TABLE_URL = SB_CONFIG.URL + "customers";
  const getConfig = { headers: SB_CONFIG.HEADERS() };

  this.getUsers = function () {
    return $http.get(TABLE_URL + "?select=*", getConfig);
  };

  this.getUserById = function (id) {
    return $http.get(TABLE_URL + "?id=eq." + id + "&select=*", getConfig);
  };

  this.createUser = function (user) {
    return $http.post(TABLE_URL, user, getConfig);
  };

  this.updateUser = function (id, user) {
    return $http.patch(TABLE_URL + "?id=eq." + id, user, getConfig);
  };

  this.deleteUser = function (id) {
    return $http.delete(TABLE_URL + "?id=eq." + id, getConfig);
  };

  this.searchUsers = function (query) {
    return $http.get(TABLE_URL + "?name=ilike.*" + query + "*", getConfig);
  };
});
