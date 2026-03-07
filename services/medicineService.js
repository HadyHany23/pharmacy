app.service("MedicineService", function ($http, SB_CONFIG) {
  const TABLE_URL = SB_CONFIG.URL + "medicines";
  const getConfig = { headers: SB_CONFIG.HEADERS() };

  this.getMedicines = function () {
    return $http.get(TABLE_URL + "?select=*", getConfig);
  };

  this.createMedicine = function (medicine) {
    return $http.post(TABLE_URL, medicine, getConfig);
  };

  this.updateMedicine = function (id, medicine) {
    return $http.patch(TABLE_URL + "?id=eq." + id, medicine, getConfig);
  };

  this.deleteMedicine = function (id) {
    return $http.delete(TABLE_URL + "?id=eq." + id, getConfig);
  };

  this.getMedicineById = function (id) {
    return $http.get(TABLE_URL + "?id=eq." + id + "&select=*", getConfig);
  };

  this.searchMedicines = function (query) {
    return $http.get(TABLE_URL + "?name=ilike.*" + query + "*", getConfig);
  };
});
