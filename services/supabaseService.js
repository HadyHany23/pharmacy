app.service("SupabaseService", function () {
  // These keys are found in your Supabase Project Settings -> API
  const supabaseUrl = "https://gzpotmmeyygtunfqatqy.supabase.co/rest/v1/";
  const supabaseKey = "sb_publishable_fb0oNuOvgqY2QMvCCA4iGg_zOeSHP5d";

  // This is the client both developers will use
  this.client = supabase.createClient(supabaseUrl, supabaseKey);
});
