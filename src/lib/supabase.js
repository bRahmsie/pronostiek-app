import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ixherbgwwwtmjjtckzfe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGVyYmd3d3d0bWpqdGNremZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzkzMzgsImV4cCI6MjA2NjUxNTMzOH0.CsWzIsPdVU8wvHw_qz7-S4VrcLndSWrMjFlgKj9y1wA";
export const supabase = createClient(supabaseUrl, supabaseKey);
