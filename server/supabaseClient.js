const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://jdagpvvklzabyyeuhnzx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYWdwdnZrbHphYnl5ZXVobnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTA4NTQsImV4cCI6MjA4MjM4Njg1NH0.TVEPxniBN1a9wqIBkvHudiHj-dBTwYvBNAS3rAsIYxQ"
);

module.exports = supabase;