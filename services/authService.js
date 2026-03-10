app.service("AuthService", function ($http, SB_CONFIG) {
  const PROFILE_URL = SB_CONFIG.URL + "profiles";
  const ROLES_URL = SB_CONFIG.URL + "roles";

  const getHeaders = () => ({ headers: SB_CONFIG.HEADERS() });

  this.getRoles = function () {
    return $http.get(ROLES_URL + "?select=*", getHeaders());
  };

  this.login = function (un, pw) {
    return $http.get(
      PROFILE_URL +
        "?username=eq." +
        un +
        "&password=eq." +
        pw +
        "&select=*,roles(name)",
      getHeaders(),
    );
  };

  this.register = function (userObj) {
    return $http.post(PROFILE_URL, userObj, getHeaders());
  };
});
