
import { supabase } from './supabaseClient';
import { User } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { awardAchievement, getUserProfile } from './api';

// --- UTILITY ---
const isObject = (o: any) => o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
const toSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const convertKeysToSnakeCase = (o: any): any => {
    if (isObject(o)) {
        const n: { [key:string]: any } = {};
        Object.keys(o).forEach(k => {
            n[toSnake(k)] = convertKeysToSnakeCase(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map(i => convertKeysToSnakeCase(i));
    }
    return o;
};


// Função para se cadastrar com email e senha
export const signupWithEmail = async (displayName: string, email: string, pass: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: displayName,
            }
        }
    });
    if (error) {
        throw error;
    }
};

// Função para fazer login com email e senha
export const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });
    if (error) {
        throw error;
    }
};

// Função para fazer login com o Google (OAuth)
export const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        throw error;
    }
};

// Função para fazer logout
export const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
};

// Função para enviar e-mail de redefinição de senha
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    
    if (error) {
        throw error;
    }
};

// Função para atualizar o perfil do usuário no Supabase
export const updateUserProfileDocument = async (userId: string, data: Partial<User>): Promise<void> => {
    const dataToUpdate = convertKeysToSnakeCase(data);

    // Remove chaves que não devem ser atualizadas diretamente por esta função.
    delete dataToUpdate.id;
    delete dataToUpdate.email;

    const { error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', userId);

    if (error) {
        throw error;
    }
};

// Listener para mudanças no estado de autenticação
export const onAuthUserChanged = (callback: (user: User | null) => void) => {
    
    // Função para verificar e premiar login diário
    const handleDailyLogin = async (user: User) => {
        const today = new Date().toISOString().slice(0, 10);
        const lastLogin = localStorage.getItem(`lastLogin_${user.id}`);

        if (lastLogin !== today) {
            console.log(`Daily login bonus for ${user.fullName}`);
            const newPoints = (user.points || 0) + 10;
            const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
            if (!error) {
                localStorage.setItem(`lastLogin_${user.id}`, today);
                await awardAchievement(user.id, 'daily_login');
                // Retorna o usuário com os pontos atualizados
                return { ...user, points: newPoints };
            }
        }
        return user;
    };
    
    const processSession = async (session: Session | null) => {
        if (session?.user) {
            let userProfile = await getUserProfile(session.user.id);
            if (userProfile) {
                userProfile = await handleDailyLogin(userProfile);
            }
            callback(userProfile);
        } else {
            callback(null);
        }
    };

    // O listener onAuthStateChange é acionado imediatamente com a sessão atual
    // ao ser configurado, eliminando a necessidade de uma chamada separada para getSession()
    // e evitando possíveis condições de corrida.
    return supabase.auth.onAuthStateChange((_event, session) => {
        processSession(session);
    });
};