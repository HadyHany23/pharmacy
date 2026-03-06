app.service("ProfilesService", function ($http, SB_CONFIG) {
  // Use SB_CONFIG.URL which should already have /rest/v1/
  const TABLE_URL = SB_CONFIG.URL + "profiles";
  const getConfig = { headers: SB_CONFIG.HEADERS() };

  this.getProfile = function () {
    return $http.get(TABLE_URL + "?select=*", getConfig);
  };

  this.createProfile = function (medicine) {
    return $http.post(TABLE_URL, medicine, getConfig);
  };

  this.updateProfile = function (id, medicine) {
    return $http.patch(TABLE_URL + "?id=eq." + id, medicine, getConfig);
  };

  this.deleteProfile = function (id) {
    return $http.delete(TABLE_URL + "?id=eq." + id, getConfig);
  };

  this.searchProfile = function (query) {
    return $http.get(TABLE_URL + "?name=ilike.*" + query + "*", getConfig);
  };
});
