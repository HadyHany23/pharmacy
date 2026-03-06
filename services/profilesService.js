app.service("ProfilesService", function ($http, SB_CONFIG) {
  const TABLE_URL = SB_CONFIG.URL + "profiles";
  const getConfig = { headers: SB_CONFIG.HEADERS() };

  this.getProfile = function () {
    return $http.get(TABLE_URL + "?select=*,roles(name)", getConfig);
  };

  // Renamed parameter to 'profileData' to match the context
  this.createProfile = function (profileData) {
    return $http.post(TABLE_URL, profileData, getConfig);
  };

  // Renamed parameter to 'profileData'
  this.updateProfile = function (id, profileData) {
    return $http.patch(TABLE_URL + "?id=eq." + id, profileData, getConfig);
  };

  this.deleteProfile = function (id) {
    return $http.delete(TABLE_URL + "?id=eq." + id, getConfig);
  };

  this.searchProfile = function (query) {
    // Also corrected the search field: profiles usually search by 'full_name' or 'username'
    return $http.get(TABLE_URL + "?full_name=ilike.*" + query + "*", getConfig);
  };
});
