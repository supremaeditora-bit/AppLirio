import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

// IMPORTANTE: Substitua os placeholders abaixo pelas suas credenciais do Supabase.
// Você pode encontrá-las no seu painel do Supabase em "Project Settings" > "API".
const REAL_SUPABASE_URL = "SUA_URL_DO_PROJETO_AQUI";
const REAL_SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_PUBLICA_AQUI";

// We check if the user has replaced the placeholder values.
export const areCredentialsSet = REAL_SUPABASE_URL !== "SUA_URL_DO_PROJETO_AQUI" && REAL_SUPABASE_ANON_KEY !== "SUA_CHAVE_ANON_PUBLICA_AQUI";

let supabaseUrl = REAL_SUPABASE_URL;
let supabaseAnonKey = REAL_SUPABASE_ANON_KEY;

if (!areCredentialsSet) {
    console.warn(
      "*****************************************************************\n" +
      "** AVISO: As credenciais do Supabase não foram configuradas. **\n" +
      "** Por favor, edite o arquivo 'services/supabaseClient.ts' e   **\n" +
      "** substitua os valores de placeholder pelas suas credenciais. **\n" +
      "** A aplicação usará credenciais de exemplo para carregar.    **\n" +
      "*****************************************************************"
    );
    // Use dummy valid credentials to prevent crash during initialization
    supabaseUrl = "https://example.supabase.co";
    // This is a generic, non-functional public key example
    supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
}

// Crie e exporte o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para obter o perfil de usuário
export const getProfile = async (userId: string): Promise<User | null> => {
    // Evita fazer uma chamada de API se as credenciais reais não estiverem configuradas
    if (!areCredentialsSet) {
        console.warn("Supabase não configurado. Impossível buscar perfil.");
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        // 'single()' throws an error if no rows are found or more than one is found.
        // We can ignore the "no rows" error, as it's a valid case (profile not created yet).
        if (error.code !== 'PGRST116') { // PGRST116 = "The result contains 0 rows"
           console.error('Error fetching profile:', error);
        }
        return null;
    }
    
    return data as User | null;
}