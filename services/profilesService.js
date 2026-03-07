app.service("ProfilesService", function ($http, SB_CONFIG) {
  const TABLE_URL = SB_CONFIG.URL + "profiles";
  const getConfig = { headers: SB_CONFIG.HEADERS() };

  this.getProfile = function () {
    return $http.get(TABLE_URL + "?select=*,roles(name)", getConfig);
  };

  this.createProfile = function (profileData) {
    return $http.post(TABLE_URL, profileData, getConfig);
  };

  this.updateProfile = function (id, profileData) {
    return $http.patch(TABLE_URL + "?id=eq." + id, profileData, getConfig);
  };

  this.deleteProfile = function (id) {
    return $http.delete(TABLE_URL + "?id=eq." + id, getConfig);
  };

  this.searchProfile = function (query) {
    return $http.get(TABLE_URL + "?full_name=ilike.*" + query + "*", getConfig);
  };
});
