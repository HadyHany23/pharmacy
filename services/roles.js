app.service("RolesService", function ($http, SB_CONFIG) {
  const URL = SB_CONFIG.URL + "roles";
  const config = { headers: SB_CONFIG.HEADERS() };

  this.getRoles = function () {
    return $http.get(URL + "?select=*", config);
  };

  this.addRoles = function (roleName) {
    // Supabase expects an object { name: "Value" }
    return $http.post(URL, { name: roleName }, config);
  };
});
