import { supabase, getProfile, areCredentialsSet } from './supabaseClient';
import { User } from '../types';
import { POINTS_AWARD } from './gamificationConstants';

// --- Funções de Gamificação (movidas para cá para usar Supabase) ---
export const awardAchievement = async (userId: string, achievementId: string): Promise<User | null> => {
    if (!areCredentialsSet) return null;
    
     const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('achievements')
        .eq('id', userId)
        .single();

    if (fetchError || !user) {
        console.error("Failed to fetch user for awarding achievement", fetchError);
        return null;
    }

    const currentAchievements: string[] = user.achievements || [];

    if (!currentAchievements.includes(achievementId)) {
        const newAchievements = [...currentAchievements, achievementId];
        const { data: updatedUser, error: updateError } = await supabase
            .from('profiles')
            .update({ achievements: newAchievements })
            .eq('id', userId)
            .select()
            .single();
        
        if (updateError) {
            console.error("Failed to award achievement", updateError);
            return null;
        }
        return updatedUser as User;
    }
    return null; // No update was needed
};


export const handleDailyLogin = async (user: User): Promise<User> => {
    if (!areCredentialsSet) return user;

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.lastLoginDate;

    if (lastLogin !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let awardedPoints = POINTS_AWARD.DAILY_LOGIN;
        let newStreak = user.dailyStreak || 0;

        if (lastLogin === yesterday) {
            newStreak++;
        } else {
            newStreak = 1;
        }
        
        if (newStreak === 3) awardedPoints += POINTS_AWARD.STREAK_3_DAYS;
        if (newStreak === 7) {
            awardedPoints += POINTS_AWARD.STREAK_7_DAYS;
            await awardAchievement(user.id, 'SEMPRE_FIEL');
        }

        const updatedProfileData = {
            points: (user.points || 0) + awardedPoints,
            daily_streak: newStreak,
            last_login_date: today,
        };

        const { data: updatedUser, error } = await supabase
            .from('profiles')
            .update(updatedProfileData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Failed to update daily login stats", error);
            return user; // Return original user on failure
        }
        return updatedUser as User;
    }
    return user; // No update needed
};

// --- Funções de Autenticação ---

export const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    if (!areCredentialsSet) throw new Error("Supabase não configurado.");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
};

export const loginWithGoogle = async (): Promise<void> => {
    if (!areCredentialsSet) throw new Error("Supabase não configurado.");
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin, // Redirect back to the app after login
        },
    });
    if (error) throw error;
};

export const signupWithEmail = async (displayName: string, email: string, pass: string): Promise<void> => {
    if (!areCredentialsSet) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                display_name: displayName,
                avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName || 'U')}`
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup succeeded but no user was returned.");

    // The user profile is now created via a database trigger from the supabase_schema.sql file.
    // This is more reliable than creating it from the client side.
};

export const logout = async (): Promise<void> => {
    if (!areCredentialsSet) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const onAuthUserChanged = (callback: (user: User | null) => void) => {
    if (!areCredentialsSet) {
        callback(null);
        // Return a dummy subscription object to prevent errors
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
        // Handle initial session and sign-in events
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
            let userProfile = await getProfile(session.user.id);
            if(userProfile) {
                // Handle daily login and get the updated profile back
                userProfile = await handleDailyLogin(userProfile);
            }
            callback(userProfile);
        } else if (event === 'SIGNED_OUT') {
            callback(null);
        }
    });
};

export const updateUserProfileDocument = async (userId: string, data: Partial<User>): Promise<void> => {
    if (!areCredentialsSet) return;
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    
    if (error) throw error;
};