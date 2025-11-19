
import { User, Achievement } from '../types';
import { updateUserProfileDocument } from './authService';

export const LEVELS = [
    { nivel: 0, nome: "Semente Plantada", xp: 0 },
    { nivel: 1, nome: "Broto Tenro", xp: 100 },
    { nivel: 2, nome: "Arbusto Verde", xp: 300 },
    { nivel: 3, nome: "Árvore Jovem", xp: 600 },
    { nivel: 4, nome: "Árvore Frutífera", xp: 1000 },
    { nivel: 5, nome: "Jardim Florescente", xp: 1500 }
];

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "primeira_oracao",
        nome: "Primeira Semente",
        desc: "Registrou sua primeira oração no Diário",
        icone: "🌱",
        verso: "A semente é a palavra de Deus. (Lc 8:11)",
        requisito: { tipo: "diario", count: 1 }
    },
    {
        id: "sete_dias",
        nome: "Raízes Profundas",
        desc: "Completou 7 dias de devocionais (não consecutivos)",
        icone: "🌿",
        verso: "Como árvore plantada junto a ribeiros. (Sl 1:3)",
        requisito: { tipo: "streak", count: 7 }
    },
    {
        id: "primeira_trilha",
        nome: "Caminho Iluminado",
        desc: "Concluiu sua primeira trilha de mentoria ou devocional",
        icone: "✨",
        verso: "Lâmpada para os meus pés é a tua palavra. (Sl 119:105)",
        requisito: { tipo: "conteudo", count: 1 }
    },
    {
        id: "comunidade",
        nome: "Mesa Compartilhada",
        desc: "Compartilhou um testemunho na comunidade",
        icone: "🕊️",
        verso: "Onde dois ou três estiverem reunidos. (Mt 18:20)",
        requisito: { tipo: "testemunho", count: 1 }
    },
    {
        id: "intercessao",
        nome: "Voz Mansa",
        desc: "Orou por uma irmã na comunidade",
        icone: "🙏",
        verso: "Orai uns pelos outros. (Tg 5:16)",
        requisito: { tipo: "oracao_por_irma", count: 1 }
    },
    {
        id: "constancia",
        nome: "Colheita Jubilosa",
        desc: "Alcançou 1000 pontos de experiência",
        icone: "🌾",
        verso: "Semeia em lágrimas, colhe em júbilo. (Sl 126:5)",
        requisito: { tipo: "xp", count: 1000 }
    }
];

export const ACTIVITIES = {
    devocional_completo: { xp: 10, id: 'devocional_completo' },
    trilha_concluida: { xp: 100, id: 'trilha_concluida' },
    oracao_por_irma: { xp: 5, id: 'oracao_por_irma' },
    testemunho_compartilhado: { xp: 20, id: 'testemunho_compartilhado' },
    diario_preenchido: { xp: 5, id: 'diario_preenchido' },
    login_diario: { xp: 2, id: 'login_diario' } // Ganha só por abrir o app
};

export type ActivityType = keyof typeof ACTIVITIES;

export function processActivity(user: User, activity: ActivityType): Partial<User> {
    const xpGain = ACTIVITIES[activity].xp;
    let newExperience = (user.experience || 0) + xpGain;
    
    // Calculate Level
    let newLevel = user.gardenLevel || 0;
    let newLevelName = user.gardenLevelName || LEVELS[0].nome;

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (newExperience >= LEVELS[i].xp) {
            newLevel = LEVELS[i].nivel;
            newLevelName = LEVELS[i].nome;
            break;
        }
    }

    // Calculate Streak (Simplified logic: check if last activity was yesterday)
    const today = new Date().toDateString();
    const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate).toDateString() : null;
    
    let newCurrentStreak = user.currentStreak || 0;
    
    if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
            newCurrentStreak += 1;
        } else {
            newCurrentStreak = 1; // Reset or start new
        }
    }
    
    const newLongestStreak = Math.max(user.longestStreak || 0, newCurrentStreak);

    // Check Achievements
    let newUnlockedAchievements = [...(user.unlockedAchievementIds || [])];
    
    ACHIEVEMENTS.forEach(ach => {
        if (newUnlockedAchievements.includes(ach.id)) return;

        let unlocked = false;
        if (ach.requisito?.tipo === 'xp' && newExperience >= ach.requisito.count) unlocked = true;
        if (ach.requisito?.tipo === 'streak' && newCurrentStreak >= ach.requisito.count) unlocked = true;
        
        // Specific triggers handled by call site or inferred? 
        // Ideally we need count history. For simplicity, we'll unlock based on immediate action context + user stats
        if (ach.requisito?.tipo === 'diario' && activity === 'diario_preenchido') unlocked = true;
        if (ach.requisito?.tipo === 'testemunho' && activity === 'testemunho_compartilhado') unlocked = true;
        if (ach.requisito?.tipo === 'oracao_por_irma' && activity === 'oracao_por_irma') unlocked = true;
        if (ach.requisito?.tipo === 'conteudo' && (activity === 'devocional_completo' || activity === 'trilha_concluida')) unlocked = true;

        if (unlocked) {
            newUnlockedAchievements.push(ach.id);
            // Could trigger a toast notification here via a global event or callback
        }
    });

    const updates: Partial<User> = {
        experience: newExperience,
        gardenLevel: newLevel,
        gardenLevelName: newLevelName,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: new Date().toISOString(),
        unlockedAchievementIds: newUnlockedAchievements
    };
    
    // Persist to DB (fire and forget for UI responsiveness, handled by App wrapper mostly)
    updateUserProfileDocument(user.id, updates).catch(err => console.error("Failed to save gamification stats", err));

    return updates;
}
