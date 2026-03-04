app.constant("SB_CONFIG", {
  URL: "https://gzpotmmeyygtunfqatqy.supabase.co/rest/v1/",
  API_KEY: "sb_publishable_fb0oNuOvgqY2QMvCCA4iGg_zOeSHP5d", // Replace with your actual key
  HEADERS: function () {
    return {
      apikey: this.API_KEY,
      Authorization: "Bearer " + this.API_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation", // This makes Supabase return the object after POST/PATCH
    };
  },
});
