import { Achievement } from '../types';

export const LEVELS: { [key: string]: { nextLevel: string; points: number } } = {
    'Terra Fértil': { nextLevel: 'Primeiros Brotos', points: 500 },
    'Primeiros Brotos': { nextLevel: 'Jardim em Flor', points: 1500 },
    'Jardim em Flor': { nextLevel: 'Fonte de Água Viva', points: 3000 },
    'Fonte de Água Viva': { nextLevel: 'Árvore Frutífera', points: 5000 },
    'Árvore Frutífera': { nextLevel: 'Árvore Frutífera', points: 5000 }
};

export const POINTS_AWARD = {
    DAILY_LOGIN: 10,
    STREAK_3_DAYS: 20,
    STREAK_7_DAYS: 50,
    COMPLETE_CONTENT: 25, // Devocional, Estudo, Mentoria
    COMPLETE_PODCAST: 20,
    COMPLETE_PLAN_DAY: 15,
    WRITE_JOURNAL: 20,
    POST_TESTIMONIAL: 50,
    POST_PRAYER: 15,
    POST_COMMENT: 10,
    PRAY_FOR_SOMEONE: 5,
    REGISTER_EVENT: 30,
};

export const GARDEN_IMAGES: { [key: string]: string } = {
    'Terra Fértil': 'https://images.unsplash.com/photo-1593431678438-3f5f3b7b2b4e?q=80&w=1000&auto=format&fit=crop',
    'Primeiros Brotos': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop',
    'Jardim em Flor': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000&auto=format&fit=crop',
    'Fonte de Água Viva': 'https://images.unsplash.com/photo-1599446465435-342664539a28?q=80&w=1000&auto=format&fit=crop',
    'Árvore Frutífera': 'https://images.unsplash.com/photo-1444004118312-58e9b3a436a9?q=80&w=1000&auto=format&fit=crop'
};

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'PRIMEIRA_ORACAO', title: 'Primeira Oração', description: 'Fazer o primeiro pedido de oração na comunidade.', icon: '🙏' },
    { id: 'VOZ_DA_FE', title: 'Voz da Fé', description: 'Publicar o primeiro testemunho.', icon: '📣' },
    { id: 'SEMENTE_DA_PALAVRA', title: 'Semente da Palavra', description: 'Iniciar o primeiro Plano de Leitura.', icon: '🌱' },
    { id: 'JORNADA_COMPLETA', title: 'Jornada Completa', description: 'Concluir um Plano de Leitura inteiro.', icon: '🏁' },
    { id: 'LEITORA_DEDICADA', title: 'Leitora Dedicada', description: 'Completar 10 devocionais.', icon: '📚' },
    { id: 'CORACAO_INTERCESSOR', title: 'Coração Intercessor', description: 'Orar por 25 pedidos.', icon: '💖' },
    { id: 'SEMPRE_FIEL', title: 'Sempre Fiel', description: 'Manter uma sequência de 7 dias de login.', icon: '🗓️' },
    { id: 'PAGINA_EM_BRANCO', title: 'Página em Branco', description: 'Escrever a primeira anotação no diário.', icon: '✍️' },
    { id: 'OUVINTE_ATENTA', title: 'Ouvinte Atenta', description: 'Ouvir 5 podcasts.', icon: '🎧' },
    { id: 'SABIA_APRENDIZ', title: 'Sábia Aprendiz', description: 'Concluir um curso de mentoria.', icon: '🎓' }
];