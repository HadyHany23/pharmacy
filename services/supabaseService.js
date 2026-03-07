app.service("SupabaseService", function () {
  const supabaseUrl = "https://gzpotmmeyygtunfqatqy.supabase.co/rest/v1/";
  const supabaseKey = "sb_publishable_fb0oNuOvgqY2QMvCCA4iGg_zOeSHP5d";

  this.client = supabase.createClient(supabaseUrl, supabaseKey);
});
