
import {
  User, ContentItem, CommunityPost, Notification, Role, LiveSession, AppearanceSettings,
  Challenge, UserChallengeCompletion, Comment, ReadingPlan, UserReadingPlanProgress, Event, JournalEntry, Announcement,
  ContentType, UserStatus
} from '../types';
import { supabase } from './supabaseClient';

// --- Default Settings ---
const defaultAppearanceSettings: AppearanceSettings = {
    isAiDevotionalEnabled: false,
    aiDevotionalScheduleTime: '06:00',
    logoSettings: {
      siteTitle: 'ELV | Assistente Espiritual',
      logoLightUrl: '',
      logoDarkUrl: '',
      logoDisplayMode: 'image-and-text',
    },
    faviconUrl: '/favicon.ico',
    themeColors: {
      lightBg: '#FBF8F1',
      lightComponentBg: '#FAF9F6',
      lightText: '#5C3D2E',
      darkComponentBg: '#2C3E2A',
      darkBg: '#1A2918',
      lightAccent: '#C0A063',
      darkAccent: '#D9C7A6',
      lightButtonBg: '#C0A063', // Dourado Suave
      lightButtonText: '#2C3E2A', // Verde Mata
      darkButtonBg: '#D9C7A6', // Dourado mais claro para dark mode
      darkButtonText: '#2C3E2A', // Verde Mata
    },
    useBackgroundImage: false,
    backgroundImageUrlLight: '',
    backgroundImageUrlDark: '',
    componentBackgroundImageUrlLight: '',
    componentBackgroundImageUrlDark: '',
    faq: [
        {
            id: '1',
            question: "O que é a Escola Lírios do Vale?",
            answer: "A Escola Lírios do Vale (ELV) é um ecossistema espiritual dedicado a restaurar e formar mulheres em sabedoria cristã prática. Oferecemos devocionais, mentorias, estudos bíblicos e uma comunidade segura para crescimento espiritual e emocional."
        },
        {
            id: '2',
            question: "Como funcionam os devocionais diários?",
            answer: "Todos os dias, você receberá um novo devocional com um tema específico, versículo bíblico, reflexão, oração e um desafio prático. Você pode marcar como concluído para acompanhar seu progresso no 'Meu Jardim'."
        }
    ],
    termsOfUse: "Estes termos de uso regem seu acesso e uso da plataforma Escola Lírios do Vale. Ao acessar ou usar o serviço, você concorda em ficar vinculado a estes termos. O conteúdo disponibilizado é para edificação pessoal e crescimento espiritual. Comportamentos desrespeitosos na comunidade não serão tolerados.",
    privacyPolicy: "Sua privacidade é importante para nós. A Escola Lírios do Vale coleta apenas os dados necessários para personalizar sua experiência (nome, e-mail, progresso). Não compartilhamos seus dados pessoais com terceiros para fins comerciais. Seus registros no Diário Espiritual são privados e criptografados.",
    contactInfo: "Para suporte, dúvidas ou sugestões, entre em contato conosco:\n\nE-mail: contato@escolaliriosdovale.com\nWhatsApp: (11) 99999-9999\nHorário de atendimento: Seg a Sex, das 9h às 18h.",
    pageHeaders: {
        mentorships: {
            title: 'Mentorias',
            subtitle: 'Cursos e trilhas de conhecimento para guiar sua jornada de crescimento.',
            imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1374&auto=format&fit=crop'
        },
        prayers: {
            title: 'Pedidos de Oração',
            subtitle: '"Orai uns pelos outros, para que sareis." Compartilhe suas necessidades e interceda pelos irmãos.',
            imageUrl: 'https://images.unsplash.com/photo-1605170448304-2570e8b7d10c?q=80&w=1370&auto=format&fit=crop'
        },
        studies: {
            title: 'Grupos de Estudo',
            subtitle: 'Debata a Palavra, compartilhe insights e cresça em comunhão.',
            imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1373&auto=format&fit=crop'
        },
        testimonials: {
            title: 'Testemunhos de Fé',
            subtitle: 'Histórias reais de transformação e graça. Compartilhe a sua também.',
            imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632&auto=format&fit=crop'
        },
        readingPlans: {
            title: 'Planos de Leitura',
            subtitle: 'Aprofunde-se nas Escrituras com roteiros guiados para fortalecer sua fé diariamente.',
            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1473&auto=format&fit=crop'
        },
        events: {
            title: 'Eventos',
            subtitle: 'Participe de nossas conferências, workshops e encontros para crescer em comunhão.',
            imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop'
        },
        podcasts: {
            title: 'Podcasts',
            subtitle: 'Ouça palavras de sabedoria onde quer que você esteja.',
            imageUrl: 'https://images.unsplash.com/photo-1590602847861-e3596f1914ce?q=80&w=1332&auto=format&fit=crop'
        },
        journal: {
            title: 'Meu Diário',
            subtitle: 'Seu jardim secreto de reflexões e gratidão.',
            imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop'
        },
        bookLaunch: {
            title: 'Lançamento',
            subtitle: 'Conheça a nossa mais nova obra literária.',
            imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1470&auto=format&fit=crop'
        }
    },
    bookLaunch: {
        bookTitle: "Floresça no Vale",
        bookSubtitle: "Sabedoria para tempos áridos",
        bookCoverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        bookPrice: 49.90,
        bookSynopsis: "Um guia prático e espiritual para mulheres que desejam encontrar propósito em meio às dificuldades. Com base em ensinamentos bíblicos e experiências reais, este livro é um convite para transformar seu deserto em um jardim florescente.",
        authorName: "Ana Clara Rocha",
        authorBio: "Fundadora da Escola Lírios do Vale, mentora de mulheres e apaixonada por ensinar a Palavra de Deus de forma simples e profunda.",
        authorImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop"
    }
};

// --- UTILS: snake_case <-> camelCase ---

const toCamel = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
const toSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const isObject = (o: any) => o === Object(o) && !Array.isArray(o) && typeof o !== 'function';

const convertKeysToCamelCase = <T>(o: any): T => {
    if (isObject(o)) {
        const n: { [key: string]: any } = {};
        Object.keys(o).forEach(k => {
            n[toCamel(k)] = convertKeysToCamelCase(o[k]);
        });
        return n as T;
    } else if (Array.isArray(o)) {
        return o.map(i => convertKeysToCamelCase(i)) as any;
    }
    return o as T;
};

const convertKeysToSnakeCase = (o: any): any => {
    if (isObject(o)) {
        const n: { [key: string]: any } = {};
        Object.keys(o).forEach(k => {
            n[toSnake(k)] = convertKeysToSnakeCase(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map(i => convertKeysToSnakeCase(i));
    }
    return o;
};

// --- ERROR HELPER ---
function handleSupabaseError(error: any, context: string) {
    if (error) {
        // FIX: JSON.stringify ensures we see the actual error structure instead of [object Object]
        console.error(`Supabase error in ${context}:`, JSON.stringify(error, null, 2));
        
        let message = `Erro em '${context}': ${error.message || 'Erro desconhecido'}`;
        
        if (error.message?.includes("violates row-level security policy")) {
            message = `Permissão negada em '${context}'. AÇÃO NECESSÁRIA: Verifique as políticas de RLS (Row Level Security) para esta tabela no painel do Supabase.`;
        }
        if (error.code === '42P01' || (error.message?.includes("relation") && error.message?.includes("does not exist"))) {
            message = `Tabela não encontrada em '${context}'. AÇÃO NECESSÁRIA: A tabela parece estar faltando. Você executou o script SQL inicial para configurar o banco de dados?`;
        }
        if (error.message?.includes("JWT") || error.code?.includes("PGRST301")) {
             message = `Erro de autenticação em '${context}'. AÇÃO NECESSÁRI: Verifique se a URL e a Chave anônima (anon key) do Supabase estão corretas em 'services/supabaseClient.ts'.`;
        }

        throw new Error(message);
    }
}


// Helper para atualizar arrays em colunas JSONB
const updateJsonbArray = async (
  table: string,
  rowId: string,
  column: string,
  itemIdentifier: any, // The item to add/remove or an ID to identify it
  itemFactory: (user?: User) => any, // Factory to create the item, user is optional
  check: (item: any, identifier: any) => boolean,
  lookupUserId?: string // The actual user ID to look up for the factory
) => {
    const { data, error } = await supabase.from(table).select(column).eq('id', rowId).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError(error, `updateJsonbArray:select from ${table}`);
    if (!data) throw new Error(`Registro com id ${rowId} não encontrado na tabela ${table}.`);
    
    let currentArray = convertKeysToCamelCase<any[]>(data[column] || []);
    
    const itemIndex = currentArray.findIndex(item => check(item, itemIdentifier));
    
    if (itemIndex > -1) {
        currentArray.splice(itemIndex, 1); // Remove
    } else { // Add
        if (lookupUserId) { // If a user ID is provided for lookup
            const userProfile = await getUserProfile(lookupUserId);
            if (userProfile) {
                currentArray.push(itemFactory(userProfile));
            } else {
                 console.warn(`User profile not found for ID: ${lookupUserId}. Cannot add item.`);
            }
        } else { // If no user ID lookup is needed
            currentArray.push(itemFactory());
        }
    }

    const { error: updateError } = await supabase.from(table).update({ [column]: convertKeysToSnakeCase(currentArray) }).eq('id', rowId);
    handleSupabaseError(updateError, `updateJsonbArray:update on ${table}`);
};

// --- User API ---
export const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<User>(data) : null;
    } catch (error: any) {
        console.warn(`Could not fetch user profile: ${error.message}`);
        return null;
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data ? convertKeysToCamelCase<User[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch all users: ${error.message}`);
        return [];
    }
};

export const updateUserRole = async (userId: string, role: Role): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    handleSupabaseError(error, 'updateUserRole');
};

export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    handleSupabaseError(error, 'updateUserStatus');
};

// --- Content API ---
const fetchContent = async (type?: ContentType): Promise<ContentItem[]> => {
    try {
        let query = supabase.from('content').select('*');
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<ContentItem[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch content (type: ${type || 'all'}): ${error.message}`);
        return [];
    }
}
export const getAllContent = async (): Promise<ContentItem[]> => fetchContent();
export const getContentItem = async (id: string): Promise<ContentItem | undefined> => {
    try {
        const { data, error } = await supabase.from('content').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<ContentItem>(data) : undefined;
    } catch (error: any) {
        console.warn(`Could not fetch content item (id: ${id}): ${error.message}`);
        return undefined;
    }
};
export const getDevotionals = async (): Promise<ContentItem[]> => fetchContent('Devocional');
export const getMentorships = async (): Promise<ContentItem[]> => fetchContent('Mentoria');
export const getPodcastEpisodes = async (): Promise<ContentItem[]> => fetchContent('Podcast');

export const createContentItem = async (item: Omit<ContentItem, 'id' | 'createdAt' | 'comments' | 'reactions'>): Promise<void> => {
    const { error } = await supabase.from('content').insert(convertKeysToSnakeCase(item));
    handleSupabaseError(error, 'createContentItem');
};

export const updateContentItem = async (item: ContentItem): Promise<void> => {
    const { id, ...itemData } = item;
    const { error } = await supabase.from('content').update(convertKeysToSnakeCase(itemData)).eq('id', id);
    handleSupabaseError(error, `updateContentItem (id: ${id})`);
};

export const deleteContentItem = async (id: string): Promise<void> => {
    const { error } = await supabase.from('content').delete().eq('id', id);
    handleSupabaseError(error, `deleteContentItem (id: ${id})`);
};

// --- Community Posts API ---
export const getCommunityPosts = async (room: 'testemunhos' | 'oracao' | 'estudos'): Promise<CommunityPost[]> => {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .select('*, author:profiles(*)')
            .eq('room', room)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<CommunityPost[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch community posts (room: ${room}): ${error.message}`);
        return [];
    }
};

export const getCommunityPostById = async (id: string): Promise<CommunityPost | null> => {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .select('*, author:profiles(*)')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<CommunityPost>(data) : null;
    } catch (error: any) {
        console.warn(`Could not fetch community post by ID (id: ${id}): ${error.message}`);
        return null;
    }
};

export const getAllCommunityPostsForAdmin = async (): Promise<CommunityPost[]> => {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .select('*, author:profiles(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<CommunityPost[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch all community posts for admin: ${error.message}`);
        return [];
    }
};

export const createCommunityPost = async (post: { id?: string; room: string; title: string; body: string; authorId: string; imageUrl?: string; isAnonymous?: boolean }): Promise<void> => {
    const dataToInsert = {
        id: post.id, // Optional ID
        room: post.room,
        title: post.title,
        body: post.body,
        author_id: post.authorId,
        image_url: post.imageUrl,
        is_anonymous: post.isAnonymous,
    };
    const { error } = await supabase.from('community_posts').insert(dataToInsert);
    handleSupabaseError(error, 'createCommunityPost');
};

export const updateCommunityPost = async (id: string, updates: Partial<CommunityPost>): Promise<void> => {
    const { error } = await supabase.from('community_posts').update(convertKeysToSnakeCase(updates)).eq('id', id);
    handleSupabaseError(error, `updateCommunityPost (id: ${id})`);
};

export const deleteCommunityPost = async (id: string): Promise<void> => {
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    handleSupabaseError(error, `deleteCommunityPost (id: ${id})`);
};

// --- Interactions (Reactions, Comments, Saves) ---
export const addReactionToPost = (postId: string, userId: string) => updateJsonbArray(
    'community_posts', postId, 'reactions', userId, 
    () => ({ userId }), 
    (item, uid) => item.userId === uid
);
export const saveTestimonial = (postId: string, userId: string) => updateJsonbArray(
    'community_posts', postId, 'saved_by', userId, 
    () => userId, 
    (item, uid) => item === uid
);
export const addCommentToPost = (postId: string, body: string, user: User) => updateJsonbArray(
    'community_posts', postId, 'comments', user.id,
    (u) => ({ id: crypto.randomUUID(), body, author: { id: u!.id, fullName: u!.fullName, avatarUrl: u!.avatarUrl }, createdAt: new Date().toISOString(), reactions: [] }),
    () => false, // Always add, never remove with this specific function
    user.id
);

// Other APIs (Notifications, Live Sessions, etc.) would follow a similar pattern
export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<Notification[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch notifications: ${error.message}`);
        return [];
    }
};
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
     const { data } = await supabase.from('notifications').select('read_by').eq('id', notificationId).single();
     const readBy = data?.read_by || [];
     if (!readBy.includes(userId)) {
        const { error } = await supabase.from('notifications').update({ read_by: [...readBy, userId] }).eq('id', notificationId);
        handleSupabaseError(error, 'markNotificationAsRead');
     }
};

// Realtime Notification Helper
export const subscribeToNotifications = (
    onInsert: (notification: Notification) => void
) => {
    return supabase
        .channel('public:notifications')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload) => {
                const newNotification = convertKeysToCamelCase<Notification>(payload.new);
                onInsert(newNotification);
            }
        )
        .subscribe();
};

export const getLiveSessions = async (): Promise<LiveSession[]> => {
    try {
        const { data, error } = await supabase.from('live_sessions').select('*').order('scheduled_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<LiveSession[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch live sessions: ${error.message}`);
        return [];
    }
};

export const createLiveSession = async (session: Omit<LiveSession, 'id'>): Promise<void> => {
    const { error } = await supabase.from('live_sessions').insert(convertKeysToSnakeCase(session));
    handleSupabaseError(error, 'createLiveSession');
};

export const updateLiveSession = async (id: string, updates: Partial<LiveSession>): Promise<void> => {
    const { error } = await supabase.from('live_sessions').update(convertKeysToSnakeCase(updates)).eq('id', id);
    handleSupabaseError(error, `updateLiveSession (id: ${id})`);
};

export const deleteLiveSession = async (id: string): Promise<void> => {
    const { error } = await supabase.from('live_sessions').delete().eq('id', id);
    handleSupabaseError(error, `deleteLiveSession (id: ${id})`);
};


// Other interactions
export const addReactionToLiveSession = (sessionId: string, userId: string) => updateJsonbArray('live_sessions', sessionId, 'reactions', userId, () => ({ userId }), (item, uid) => item.userId === uid);
export const addCommentToLiveSession = (sessionId: string, body: string, user: User) => updateJsonbArray('live_sessions', sessionId, 'comments', user.id, u => ({ id: crypto.randomUUID(), body, author: { id: u!.id, fullName: u!.fullName, avatarUrl: u!.avatarUrl }, createdAt: new Date().toISOString(), reactions: [] }), () => false, user.id);
export const addReactionToLiveComment = async (sessionId: string, commentId: string, userId: string) => {
    // This is more complex because it's a nested array.
    const { data } = await supabase.from('live_sessions').select('comments').eq('id', sessionId).single();
    let comments = convertKeysToCamelCase<Comment[]>(data?.comments || []);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;
    const reactionIndex = comments[commentIndex].reactions.findIndex(r => r.userId === userId);
    if (reactionIndex > -1) {
        comments[commentIndex].reactions.splice(reactionIndex, 1);
    } else {
        comments[commentIndex].reactions.push({ userId });
    }
    const { error } = await supabase.from('live_sessions').update({ comments: convertKeysToSnakeCase(comments) }).eq('id', sessionId);
    handleSupabaseError(error, 'addReactionToLiveComment');
};
export const deleteCommentFromLiveSession = async (sessionId: string, commentId: string) => {
    const { data } = await supabase.from('live_sessions').select('comments').eq('id', sessionId).single();
    const comments = (data?.comments || []).filter((c: any) => c.id !== commentId);
    const { error } = await supabase.from('live_sessions').update({ comments }).eq('id', sessionId);
    handleSupabaseError(error, 'deleteCommentFromLiveSession');
};

export const addReactionToContent = (contentId: string, userId: string) => updateJsonbArray('content', contentId, 'reactions', userId, () => ({ userId }), (item, uid) => item.userId === uid);
export const addCommentToContent = (contentId: string, body: string, user: User) => updateJsonbArray('content', contentId, 'comments', user.id, u => ({ id: crypto.randomUUID(), body, author: { id: u!.id, fullName: u!.fullName, avatarUrl: u!.avatarUrl }, createdAt: new Date().toISOString(), reactions: [] }), () => false, user.id);
export const addReactionToContentComment = async (contentId: string, commentId: string, userId: string) => {
    const { data } = await supabase.from('content').select('comments').eq('id', contentId).single();
    let comments = convertKeysToCamelCase<Comment[]>(data?.comments || []);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;
    const reactionIndex = comments[commentIndex].reactions.findIndex(r => r.userId === userId);
    if (reactionIndex > -1) {
        comments[commentIndex].reactions.splice(reactionIndex, 1);
    } else {
        comments[commentIndex].reactions.push({ userId });
    }
    const { error } = await supabase.from('content').update({ comments: convertKeysToSnakeCase(comments) }).eq('id', contentId);
    handleSupabaseError(error, 'addReactionToContentComment');
};
export const deleteCommentFromContent = async (contentId: string, commentId: string) => {
    const { data } = await supabase.from('content').select('comments').eq('id', contentId).single();
    const comments = (data?.comments || []).filter((c: any) => c.id !== commentId);
    const { error } = await supabase.from('content').update({ comments }).eq('id', contentId);
    handleSupabaseError(error, 'deleteCommentFromContent');
};
export const deleteCommentFromPost = async (postId: string, commentId: string) => {
    const { data } = await supabase.from('community_posts').select('comments').eq('id', postId).single();
    const comments = (data?.comments || []).filter((c: any) => c.id !== commentId);
    const { error } = await supabase.from('community_posts').update({ comments }).eq('id', postId);
    handleSupabaseError(error, 'deleteCommentFromPost');
};
export const addReactionToComment = async (postId: string, commentId: string, userId: string) => {
    const { data } = await supabase.from('community_posts').select('comments').eq('id', postId).single();
    let comments = convertKeysToCamelCase<Comment[]>(data?.comments || []);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;
    const reactionIndex = comments[commentIndex].reactions.findIndex(r => r.userId === userId);
    if (reactionIndex > -1) {
        comments[commentIndex].reactions.splice(reactionIndex, 1);
    } else {
        comments[commentIndex].reactions.push({ userId });
    }
    const { error } = await supabase.from('community_posts').update({ comments: convertKeysToSnakeCase(comments) }).eq('id', postId);
    handleSupabaseError(error, 'addReactionToComment');
};

export const markContentAsComplete = (userId: string, contentId: string) => updateJsonbArray('profiles', userId, 'completed_content_ids', contentId, () => contentId, (item, cid) => item === cid);
export const unmarkContentAsComplete = async (userId: string, contentId: string) => {
    const { data } = await supabase.from('profiles').select('completed_content_ids').eq('id', userId).single();
    const completedIds = (data?.completed_content_ids || []).filter((id: string) => id !== contentId);
    const { error } = await supabase.from('profiles').update({ completed_content_ids: completedIds }).eq('id', userId);
    handleSupabaseError(error, 'unmarkContentAsComplete');
};
export const awardAchievement = (userId: string, achievementId: string) => updateJsonbArray('profiles', userId, 'unlocked_achievement_ids', achievementId, () => achievementId, (item, achId) => item === achId);


// Appearance
export const getAppearanceSettings = async (): Promise<AppearanceSettings> => {
    try {
        const { data, error } = await supabase.from('appearance_settings').select('settings').eq('id', 1).single();
        if (error) {
            // Se o erro for "PGRST116" (row not found), retorna o padrão, pois o upsert no salvamento criará a linha.
            if (error.code === 'PGRST116') {
                return defaultAppearanceSettings;
            }
            
            if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
                 console.error("Tabela 'appearance_settings' não encontrada. AÇÃO NECESSÁRIA: Você executou o script SQL inicial?");
                 return defaultAppearanceSettings;
            }
            
            throw error;
        }
        const settings = data ? convertKeysToCamelCase<Partial<AppearanceSettings>>(data.settings) : {};
        
        // Ensure pageHeaders defaults are merged if missing in DB
        const mergedSettings = { 
            ...defaultAppearanceSettings, 
            ...settings,
            pageHeaders: {
                ...defaultAppearanceSettings.pageHeaders,
                ...(settings.pageHeaders || {})
            },
            bookLaunch: {
                ...defaultAppearanceSettings.bookLaunch,
                ...(settings.bookLaunch || {})
            }
        };
        
        return mergedSettings;
    } catch (error: any) {
        console.warn(`Could not fetch appearance settings: ${error.message}`);
        return defaultAppearanceSettings;
    }
};
export const updateAppearanceSettings = async (updates: Partial<AppearanceSettings>): Promise<void> => {
    const currentSettings = await getAppearanceSettings();
    const newSettings = { ...currentSettings, ...updates };
    
    // Usamos UPSERT (insert or update) para garantir que a configuração seja salva mesmo se a tabela estiver vazia
    const { error } = await supabase.from('appearance_settings').upsert({ id: 1, settings: newSettings });
    
    handleSupabaseError(error, 'updateAppearanceSettings');
    document.dispatchEvent(new CustomEvent('settingsUpdated'));
};

// --- Push Notifications ---
export const savePushSubscription = async (userId: string, subscription: PushSubscription): Promise<void> => {
    const subscriptionData = subscription.toJSON();
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            endpoint: subscription.endpoint,
            user_id: userId,
            subscription_data: subscriptionData,
        }, { onConflict: 'endpoint' });
    
    handleSupabaseError(error, 'savePushSubscription');
};

export const removePushSubscription = async (subscription: PushSubscription): Promise<void> => {
    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

    handleSupabaseError(error, 'removePushSubscription');
};


// Challenges
export const getChallenges = async (): Promise<Challenge[]> => {
    try {
        const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<Challenge[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch challenges: ${error.message}`);
        return [];
    }
};
export const createChallenge = async (challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<void> => {
    const { error } = await supabase.from('challenges').insert(convertKeysToSnakeCase(challenge));
    handleSupabaseError(error, 'createChallenge');
};
export const updateChallenge = async (id: string, updates: Partial<Challenge>): Promise<void> => {
    const { error } = await supabase.from('challenges').update(convertKeysToSnakeCase(updates)).eq('id', id);
    handleSupabaseError(error, `updateChallenge (id: ${id})`);
};
export const deleteChallenge = async (id: string): Promise<void> => {
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    handleSupabaseError(error, `deleteChallenge (id: ${id})`);
};
export const getUserChallengeCompletions = async (userId: string): Promise<UserChallengeCompletion[]> => {
    try {
        const { data, error } = await supabase.from('user_challenge_completions').select('*').eq('user_id', userId);
        if (error) throw error;
        return data ? convertKeysToCamelCase<UserChallengeCompletion[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch user challenge completions: ${error.message}`);
        return [];
    }
};
export const completeChallenge = async (userId: string, challengeId: string): Promise<void> => {
    const { error: completionError } = await supabase.from('user_challenge_completions').insert({ user_id: userId, challenge_id: challengeId });
    handleSupabaseError(completionError, 'completeChallenge:insert');
};

// Reading Plans
export const getReadingPlans = async (): Promise<ReadingPlan[]> => {
    try {
        const { data, error } = await supabase.from('reading_plans').select('*');
        if (error) throw error;
        return data ? convertKeysToCamelCase<ReadingPlan[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch reading plans: ${error.message}`);
        return [];
    }
};
export const getReadingPlanById = async (id: string): Promise<ReadingPlan | null> => {
    try {
        const { data, error } = await supabase.from('reading_plans').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<ReadingPlan>(data) : null;
    } catch (error: any) {
        console.warn(`Could not fetch reading plan by ID (id: ${id}): ${error.message}`);
        return null;
    }
};
export const createReadingPlan = async (plan: Omit<ReadingPlan, 'id'>): Promise<void> => {
    const { error } = await supabase.from('reading_plans').insert(convertKeysToSnakeCase(plan));
    handleSupabaseError(error, 'createReadingPlan');
};
export const updateReadingPlan = async (plan: ReadingPlan): Promise<void> => {
    const { id, ...planData } = plan;
    const { error } = await supabase.from('reading_plans').update(convertKeysToSnakeCase(planData)).eq('id', id);
    handleSupabaseError(error, `updateReadingPlan (id: ${id})`);
};
export const deleteReadingPlan = async (id: string): Promise<void> => {
    const { error } = await supabase.from('reading_plans').delete().eq('id', id);
    handleSupabaseError(error, `deleteReadingPlan (id: ${id})`);
};
export const getAllUserReadingProgress = async (userId: string): Promise<UserReadingPlanProgress[]> => {
    try {
        const { data, error } = await supabase.from('user_reading_plan_progress').select('*').eq('user_id', userId);
        if (error) throw error;
        return data ? convertKeysToCamelCase<UserReadingPlanProgress[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch all user reading progress: ${error.message}`);
        return [];
    }
};
export const getUserReadingPlanProgressForPlan = async (userId: string, planId: string): Promise<UserReadingPlanProgress | null> => {
    try {
        const { data, error } = await supabase.from('user_reading_plan_progress').select('*').eq('user_id', userId).eq('plan_id', planId).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<UserReadingPlanProgress>(data) : null;
    } catch (error: any) {
        console.warn(`Could not fetch user reading progress for plan (planId: ${planId}): ${error.message}`);
        return null;
    }
};
export const updateUserReadingPlanProgress = async (userId: string, planId: string, completedDays: number[]): Promise<void> => {
    const { error } = await supabase.from('user_reading_plan_progress').upsert({ user_id: userId, plan_id: planId, completed_days: completedDays });
    handleSupabaseError(error, 'updateUserReadingPlanProgress');
};

// Events
export const getEvents = async (): Promise<Event[]> => {
    try {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<Event[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch events: ${error.message}`);
        return [];
    }
};
export const getEventById = async (id: string): Promise<Event | null> => {
    try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? convertKeysToCamelCase<Event>(data) : null;
    } catch (error: any) {
        console.warn(`Could not fetch event by ID (id: ${id}): ${error.message}`);
        return null;
    }
};
export const createEvent = async (event: Omit<Event, 'id' | 'attendeeIds'>): Promise<void> => {
    const { error } = await supabase.from('events').insert(convertKeysToSnakeCase(event));
    handleSupabaseError(error, 'createEvent');
};
export const updateEvent = async (event: Event): Promise<void> => {
    const { id, ...eventData } = event;
    const { error } = await supabase.from('events').update(convertKeysToSnakeCase(eventData)).eq('id', id);
    handleSupabaseError(error, `updateEvent (id: ${id})`);
};
export const deleteEvent = async (id: string): Promise<void> => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    handleSupabaseError(error, `deleteEvent (id: ${id})`);
};
export const registerForEvent = (eventId: string, userId: string) => updateJsonbArray('events', eventId, 'attendee_ids', userId, () => userId, (item, uid) => item === uid);

// Journal
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    try {
        const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<JournalEntry[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch journal entries: ${error.message}`);
        return [];
    }
};
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const { error } = await supabase.from('journal_entries').insert(convertKeysToSnakeCase(entry));
    handleSupabaseError(error, 'createJournalEntry');
};
export const updateJournalEntry = async (id: string, content: string, title: string): Promise<void> => {
    const { error } = await supabase.from('journal_entries').update({ content, title, updated_at: new Date().toISOString() }).eq('id', id);
    handleSupabaseError(error, `updateJournalEntry (id: ${id})`);
};
export const deleteJournalEntry = async (id: string): Promise<void> => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    handleSupabaseError(error, `deleteJournalEntry (id: ${id})`);
};

// Announcements
export const getAnnouncements = async (): Promise<Announcement[]> => {
    try {
        const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<Announcement[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch announcements: ${error.message}`);
        return [];
    }
};
export const getAllAnnouncementsForAdmin = async (): Promise<Announcement[]> => {
    try {
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data ? convertKeysToCamelCase<Announcement[]>(data) : [];
    } catch (error: any) {
        console.warn(`Could not fetch all announcements for admin: ${error.message}`);
        return [];
    }
};
export const createAnnouncement = async (ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> => {
    const { error } = await supabase.from('announcements').insert(convertKeysToSnakeCase(ann));
    handleSupabaseError(error, 'createAnnouncement');
    document.dispatchEvent(new CustomEvent('announcementsUpdated'));
};
export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<void> => {
    const { error } = await supabase.from('announcements').update(convertKeysToSnakeCase(updates)).eq('id', id);
    handleSupabaseError(error, 'updateAnnouncement');
    document.dispatchEvent(new CustomEvent('announcementsUpdated'));
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    handleSupabaseError(error, `deleteAnnouncement (id: ${id})`);
    document.dispatchEvent(new CustomEvent('announcementsUpdated'));
};
