import { createClient } from '@supabase/supabase-js';

// NOTA: Se você está configurando o projeto pela primeira vez ou encontrou
// um erro como "table 'profiles' does not exist", por favor, execute o script
// encontrado em `database.sql` no SQL Editor do seu projeto Supabase.

// As credenciais do Supabase foram fornecidas e inseridas diretamente.
const supabaseUrl = "https://iucderemdxdlsjhwzskn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Y2RlcmVtZHhkbHNqaHd6c2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Mjg4NTIsImV4cCI6MjA3ODMwNDg1Mn0.C9tCePCF2IPrvuecA90Bxs6oq9ze-EFljjb-r36t0JA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);