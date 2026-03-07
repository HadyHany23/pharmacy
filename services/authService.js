app.service("AuthService", function ($http, SB_CONFIG) {
  const PROFILE_URL = SB_CONFIG.URL + "profiles";
  const ROLES_URL = SB_CONFIG.URL + "roles";
  const config = { headers: SB_CONFIG.HEADERS() };

  this.getRoles = function () {
    return $http.get(ROLES_URL + "?select=*", config);
  };

  this.login = function (un, pw) {
    return $http.get(
      PROFILE_URL +
        "?username=eq." +
        un +
        "&password=eq." +
        pw +
        "&select=*,roles(name)",
      config,
    );
  };

  this.register = function (userObj) {
    return $http.post(PROFILE_URL, userObj, config);
  };
});
