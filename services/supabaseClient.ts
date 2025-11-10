
import { createClient } from '@supabase/supabase-js';

// NOTA: Se você está configurando o projeto pela primeira vez ou encontrou
// um erro como "table 'profiles' does not exist", por favor, execute o script
// encontrado em `database.sql` no SQL Editor do seu projeto Supabase.

// Credenciais do projeto Supabase "Lirio Project"
const supabaseUrl = 'https://gswsbuiakyoghgvnhowj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3NidWlha3lvZ2hndm5ob3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODY3NzksImV4cCI6MjA3ODE2Mjc3OX0.TZwfShqY8TtcpzYPDfnUhPjj43r5yjr4eTxyr3lZD4Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
