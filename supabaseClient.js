import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipwujqgkvvizfhhxoobm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd3VqcWdrdnZpemZoaHhvb2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3ODA5MTUsImV4cCI6MjA0ODM1NjkxNX0.asLYRuNTXVyJW5nI35rDqf84IviIEcOU3lf8DNPaW-4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);