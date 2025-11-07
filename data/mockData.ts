import { User, ContentItem, CommunityPost, Notification, Role, Comment, PodcastEpisode, LiveSession, ReadingPlan, UserReadingPlanProgress } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-ana-sofia',
    email: 'ana.sofia@example.com',
    displayName: 'Ana Sofia',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80',
    role: 'aluna',
    // FIX: Changed number[] to string[] to match User type.
    completedContentIds: ['1', '5', '8'],
    bio: 'Mãe, esposa e serva de Deus, buscando crescer na fé a cada dia.',
    points: 1250,
    level: 'Guerreira de Oração'
  },
  {
    id: 'user-beatriz-costa',
    email: 'beatriz.costa@example.com',
    displayName: 'Beatriz Costa',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    role: 'aluna',
    // FIX: Changed number[] to string[] to match User type.
    completedContentIds: ['1', '2'],
    bio: 'Jovem apaixonada por missões e por compartilhar o amor de Cristo.',
    points: 800,
    level: 'Aprendiz da Palavra'
  },
  {
    id: 'user-clara-ribeiro',
    email: 'clara.ribeiro@example.com',
    displayName: 'Clara Ribeiro',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
    role: 'mentora',
    // FIX: Changed number[] to string[] to match User type.
    completedContentIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    bio: 'Mentora e conselheira, com mais de 20 anos de caminhada com o Senhor.',
    points: 5000,
    level: 'Mentora de Fé'
  },
  {
    id: 'user-daniela-almeida',
    email: 'daniela.almeida@example.com',
    displayName: 'Daniela Almeida',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80',
    role: 'admin',
    completedContentIds: [],
    bio: 'Coordenadora da Escola Lírios do Vale. Servindo com amor e dedicação.',
    points: 9999,
    level: 'Mentora de Fé'
  },
  {
    id: 'user-elena-ferreira',
    email: 'elena.ferreira@example.com',
    displayName: 'Elena Ferreira',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=772&q=80',
    role: 'aluna',
    // FIX: Changed number[] to string[] to match User type.
    completedContentIds: ['3'],
    bio: 'Estudante de teologia, buscando aprofundar meu conhecimento da Palavra.',
    points: 350,
    level: 'Iniciante da Fé'
  }
];

export const mockContent: ContentItem[] = [
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '1',
    title: "A Força da Mulher que Ora",
    subtitle: "Devocional Semanal",
    description: "Descubra o poder que existe na oração constante e como ela pode transformar todas as áreas da sua vida.",
    imageUrl: "https://images.unsplash.com/photo-1589156229623-453775a6c6a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Devocional",
    badge: "Novo",
    contentBody: "<h2>O Poder da Oração</h2><p>A oração é a nossa linha direta com o Pai. Em Filipenses 4:6-7, somos instruídas a não andar ansiosas por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentar nossos pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará os nossos corações e as nossas mentes em Cristo Jesus.</p><p>Nesta semana, vamos explorar como a prática diária da oração pode fortalecer nossa fé, acalmar nossas tempestades e nos aproximar do coração de Deus. Separe um momento do seu dia para se conectar com Ele.</p>",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '2',
    title: "Liderança Feminina",
    subtitle: "Série de Mentoria",
    description: "Aprenda com mulheres da Bíblia e da atualidade sobre como exercer uma liderança piedosa e eficaz em casa, na igreja e no trabalho.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
    type: "Mentoria",
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '3',
    title: "Estudo do Livro de Ester",
    subtitle: "Estudo Bíblico",
    description: "Uma jornada pela vida de uma rainha corajosa que foi usada por Deus para salvar seu povo. 'Para um tempo como este'.",
    imageUrl: "https://images.unsplash.com/photo-1528628972233-40f0a8e4a7b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Estudo",
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '4',
    title: "Café com Fé",
    subtitle: "Podcast Semanal",
    description: "Conversas leves e profundas sobre como viver a fé cristã no mundo de hoje. Pegue seu café e venha conosco!",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1937&q=80",
    type: "Podcast",
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '5',
    title: "Encontrando Paz na Tempestade",
    subtitle: "Devocional Diário",
    description: "Jesus acalmou a tempestade com Sua palavra. Ele pode fazer o mesmo em seu coração. Aprenda a confiar Nele.",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Devocional",
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '6',
    title: "Live: Vencendo a Ansiedade",
    subtitle: "Live Gravada",
    description: "Assista à nossa conversa com a psicóloga cristã Dra. Isabela sobre como lidar com a ansiedade à luz da fé.",
    imageUrl: "https://images.unsplash.com/photo-1588612162624-3a7a7a37c3a44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Live",
    actionUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '7',
    title: "Casamento Blindado",
    subtitle: "Série de Mentoria",
    description: "Princípios bíblicos para construir um casamento forte, saudável e que glorifica a Deus.",
    imageUrl: "https://images.unsplash.com/photo-1523952578875-e6decec37d27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Mentoria"
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '8',
    title: "As Mulheres da Bíblia",
    subtitle: "Estudo Bíblico",
    description: "Conheça as histórias de fé, coragem e falhas de mulheres como Rute, Ana, Maria e muitas outras.",
    imageUrl: "https://images.unsplash.com/photo-1505664194779-8be22b5db093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Estudo"
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '9',
    title: "Florescendo no Deserto",
    subtitle: "Devocional Semanal",
    description: "Assim como uma flor pode nascer no deserto, Deus pode trazer beleza e propósito aos períodos áridos da nossa vida.",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Devocional"
  },
  {
    // FIX: Changed id to string to match ContentItem type.
    id: '10',
    title: "Finanças à Luz da Bíblia",
    subtitle: "Série de Mentoria",
    description: "Aprenda a administrar seus recursos com sabedoria, generosidade e princípios que honram a Deus.",
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    type: "Mentoria"
  },
];

export const mockPodcastEpisodes: PodcastEpisode[] = [
    {
        id: 'ep1',
        title: 'Mantendo a Fé na Adversidade',
        description: 'No nosso primeiro episódio, conversamos sobre como manter a fé em meio às adversidades do dia a dia. Pegue seu café e venha conosco!',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1937&q=80',
        duration: 270, // 4:30
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: 'ep2',
        title: 'O Propósito da Oração',
        description: 'Uma conversa profunda com a mentora Clara Ribeiro sobre por que oramos, como orar e o que esperar da oração.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        imageUrl: 'https://images.unsplash.com/photo-1604881988758-f76ad2f78b81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
        duration: 350, // 5:50
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: 'ep3',
        title: 'Maternidade Real e a Graça de Deus',
        description: 'Ana Sofia compartilha sua jornada na maternidade, com seus desafios e alegrias, e como a graça de Deus a sustenta.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        imageUrl: 'https://images.unsplash.com/photo-1515222375429-9e8a5c72a8a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
        duration: 310, // 5:10
        createdAt: new Date().toISOString(),
    }
];

export const mockLiveSessions: LiveSession[] = [
    {
        id: 'live1',
        title: 'Estudo Ao Vivo: O Fruto do Espírito',
        description: 'Junte-se a nós para um estudo profundo de Gálatas 5. Vamos explorar juntos como cultivar o fruto do Espírito em nossas vidas.',
        youtubeId: 'L_LUpnjgPso',
        status: 'upcoming',
        scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
    {
        id: 'live2',
        title: 'Live de Oração e Intercessão',
        description: 'Uma noite dedicada a clamar a Deus por nossas famílias, nossa igreja e nossa nação. Envie seus pedidos!',
        youtubeId: 'z_AbA8I2Lvo',
        status: 'upcoming',
        scheduledAt: new Date(Date.now() + 86400000 * 10).toISOString(),
    },
    {
        id: 'live3',
        title: 'Vencendo a Ansiedade com a Fé',
        description: 'Assista à nossa conversa com a psicóloga cristã Dra. Isabela sobre como lidar com a ansiedade à luz da fé e da ciência.',
        youtubeId: '8B5_g6iC9j4',
        status: 'past',
        scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
];

export const mockCommunityPosts: CommunityPost[] = [
    {
        id: 'test-1',
        room: 'testemunhos',
        title: 'O milagre da cura do meu filho!',
        body: 'Amadas, quero glorificar a Deus pela vida do meu filho! Após muitas orações e noites em claro, os médicos nos deram a notícia de que ele está completamente curado. A honra e a glória sejam dadas ao nosso Deus que pode todas as coisas!',
        imageUrl: 'https://images.unsplash.com/photo-1596707114795-a7a7a37c3a44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
        author: { id: 'user-ana-sofia', name: 'Ana Sofia', avatarUrl: mockUsers[0].avatarUrl },
        reactions: [{ userId: 'user-beatriz-costa' }, { userId: 'user-clara-ribeiro' }],
        comments: [
            { id: 'c1', body: 'Glória a Deus! Que notícia maravilhosa!', author: { id: 'user-beatriz-costa', name: 'Beatriz Costa', avatarUrl: mockUsers[1].avatarUrl }, createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'c2', body: 'Deus é fiel! Me alegro com você, Ana!', author: { id: 'user-clara-ribeiro', name: 'Clara Ribeiro', avatarUrl: mockUsers[2].avatarUrl }, createdAt: new Date(Date.now() - 1800000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        savedBy: ['user-clara-ribeiro']
    },
    {
        id: 'pray-1',
        room: 'oracao',
        title: 'Oração pela minha família',
        body: 'Irmãs, peço oração pela minha família. Estamos passando por um momento de muitas provações e preciso de força e sabedoria para guiar meu lar nos caminhos do Senhor. Que Deus nos cubra com Sua graça.',
        author: { id: 'user-beatriz-costa', name: 'Beatriz Costa', avatarUrl: mockUsers[1].avatarUrl },
        reactions: [{ userId: 'user-ana-sofia' }, { userId: 'user-elena-ferreira' }, { userId: 'user-clara-ribeiro' }],
        comments: [
             { id: 'c3', body: 'Estarei orando por vocês, Beatriz. O Senhor é o nosso refúgio e fortaleza.', author: { id: 'user-ana-sofia', name: 'Ana Sofia', avatarUrl: mockUsers[0].avatarUrl }, createdAt: new Date(Date.now() - 7200000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'study-1',
        room: 'estudos',
        title: 'Dúvida sobre passagem em Romanos',
        body: 'Estou estudando Romanos 8 e fiquei pensativa sobre o versículo 28: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus". Como vocês aplicam isso em meio ao sofrimento? Gostaria de ouvir as reflexões de vocês.',
        author: { id: 'user-elena-ferreira', name: 'Elena Ferreira', avatarUrl: mockUsers[4].avatarUrl },
        reactions: [{ userId: 'user-clara-ribeiro' }],
        comments: [
            { id: 'c4', body: 'Ótima pergunta, Elena! É um exercício de fé crer que até as dores têm um propósito no plano de Deus. Muitas vezes, é no sofrimento que Ele molda nosso caráter.', author: { id: 'user-clara-ribeiro', name: 'Clara Ribeiro', avatarUrl: mockUsers[2].avatarUrl }, createdAt: new Date(Date.now() - 900000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
        id: 'test-2',
        room: 'testemunhos',
        title: 'Porta de emprego aberta!',
        body: 'Depois de meses buscando uma recolocação, Deus abriu uma porta de emprego que parecia impossível! Sou grata por cada oração e por Ele nunca nos abandonar. Confiem no tempo do Senhor!',
        author: { id: 'user-beatriz-costa', name: 'Beatriz Costa', avatarUrl: mockUsers[1].avatarUrl },
        reactions: [{ userId: 'user-ana-sofia' }],
        comments: [],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        savedBy: []
    },
    {
        id: 'pray-2',
        room: 'oracao',
        title: 'Sabedoria para decisão importante',
        body: 'Preciso tomar uma decisão muito importante no meu trabalho esta semana e peço que orem por mim, para que Deus me dê sabedoria e discernimento para fazer a escolha que O glorifique.',
        author: { id: 'user-ana-sofia', name: 'Ana Sofia', avatarUrl: mockUsers[0].avatarUrl },
        reactions: [{ userId: 'user-beatriz-costa' }, { userId: 'user-clara-ribeiro' }],
        comments: [],
        createdAt: new Date(Date.now() - 604800000).toISOString()
    }
];

export const mockNotifications: Notification[] = [
    {
        id: 'n1',
        title: 'Novo devocional disponível!',
        body: 'Comece sua semana com a reflexão "Florescendo no Deserto".',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readBy: []
    },
    {
        id: 'n2',
        title: 'Clara Ribeiro comentou no seu pedido de oração.',
        body: '"Estarei orando por vocês, Beatriz. O Senhor é o nosso refúgio..."',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        readBy: ['user-beatriz-costa']
    },
    {
        id: 'n3',
        title: 'Sua mentoria começa em breve',
        body: 'Não perca a primeira aula da série "Casamento Blindado" hoje às 20h.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        readBy: []
    }
];

export const mockReadingPlans: ReadingPlan[] = [
    {
        id: 'plan-salmo-23',
        title: 'Descansando no Salmo 23',
        description: 'Uma jornada de 6 dias pelo Salmo mais conhecido da Bíblia, encontrando conforto e segurança no cuidado do Bom Pastor.',
        imageUrl: 'https://images.unsplash.com/photo-1501695577265-5c4a17406a4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80',
        durationDays: 6,
        days: [
            { day: 1, title: 'O Senhor é o meu Pastor', passage: 'Salmos 23:1', content: 'Começamos nossa jornada com a declaração fundamental de Davi: **"O Senhor é o meu pastor; nada me faltará."** Refletir sobre isso significa reconhecer nossa total dependência de Deus. Ele não é apenas *um* pastor, mas *o meu* pastor. Essa é uma declaração pessoal de fé e relacionamento. Hoje, medite sobre o que significa ter Deus como seu pastor pessoal. Em quais áreas da sua vida você precisa confiar que Ele suprirá e que nada lhe faltará?' },
            { day: 2, title: 'Refrigério para a Alma', passage: 'Salmos 23:2-3a', content: '**"Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma..."** Em um mundo agitado, Deus nos convida ao descanso. Os "verdes pastos" e as "águas tranquilas" não são apenas lugares físicos, mas um estado de alma que encontramos Nele. Onde você tem buscado refrigério? O convite de hoje é para parar, respirar e permitir que o Pastor guie você a um lugar de paz e restauração interior.' },
            { day: 3, title: 'Guiado por Veredas de Justiça', passage: 'Salmos 23:3b', content: '**"...guia-me pelas veredas da justiça, por amor do seu nome."** A nossa jornada com Deus tem um propósito: sermos moldadas à imagem de Cristo. As "veredas da justiça" são os caminhos de retidão e santidade que Ele nos chama a trilhar. Essa guia não é para nosso próprio mérito, mas por "amor do seu nome", para a glória Dele. Pergunte-se hoje: minhas escolhas e caminhos estão honrando o nome do meu Pastor?' },
            { day: 4, title: 'Atravessando o Vale', passage: 'Salmos 23:4', content: '**"Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam."** A vida cristã não é isenta de vales escuros. A promessa não é a ausência de dificuldades, mas a presença constante do Pastor *nelas*. A vara (para proteção) e o cajado (para guia) são instrumentos de cuidado. Em qual vale você está hoje? Lembre-se: você não está sozinha. O Pastor está com você, e Seus instrumentos de cuidado trazem consolo.' },
            { day: 5, title: 'Um Banquete na Adversidade', passage: 'Salmos 23:5', content: '**"Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo; o meu cálice transborda."** Que imagem poderosa! Deus não espera que os inimigos (dificuldades, oposição, medo) desapareçam para nos honrar. Ele prepara um banquete bem no meio da batalha. Ele nos unge com óleo, um símbolo de honra e consagração, e nos abençoa até que nosso cálice transborde. Em meio às suas lutas, consegue ver a mesa que Deus está preparando para você? ' },
            { day: 6, title: 'Bondade e Misericórdia para Sempre', passage: 'Salmos 23:6', content: '**"Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias."** A jornada termina com uma certeza inabalável. Não é um "talvez" ou "espero que sim". É "certamente". A bondade (o cuidado de Deus) e a misericórdia (Seu perdão) nos perseguem, nos acompanham em cada passo. E o destino final é a presença eterna Dele. Viva hoje com a confiança dessa promessa. A bondade e a misericórdia de Deus estão te seguindo agora mesmo.' }
        ]
    },
    {
        id: 'plan-fruto-espirito',
        title: 'Cultivando o Fruto do Espírito',
        description: 'Um estudo de 9 dias sobre as virtudes que o Espírito Santo desenvolve em nós, conforme descrito em Gálatas 5.',
        imageUrl: 'https://images.unsplash.com/photo-1523963428233-69a4c5225133?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
        durationDays: 9,
        days: [
            { day: 1, title: 'Amor', passage: 'Gálatas 5:22', content: 'O amor (ágape) é a base de todo o fruto. Não é um sentimento, mas uma decisão de agir pelo bem do outro, refletindo o amor sacrificial de Cristo. **Como você pode demonstrar esse amor hoje?**' },
            { day: 2, title: 'Alegria', passage: 'Gálatas 5:22', content: 'A alegria do Espírito não depende das circunstâncias, mas da nossa confiança em Deus. É uma contentamento profundo que vem da salvação. **Onde você tem buscado sua alegria?**' },
            { day: 3, title: 'Paz', passage: 'Gálatas 5:22', content: 'A paz que excede todo entendimento. É a tranquilidade de alma que repousa na soberania de Deus, mesmo em meio às tempestades. **Entregue suas ansiedades a Ele hoje.**' },
            { day: 4, title: 'Paciência (Longanimidade)', passage: 'Gálatas 5:22', content: 'É a capacidade de suportar as provações e as falhas dos outros sem murmurar, confiando no tempo de Deus. **Exercite a paciência com alguém hoje.**' },
            { day: 5, title: 'Amabilidade (Benignidade)', passage: 'Gálatas 5:22', content: 'É a bondade em ação. Um coração terno e uma disposição para ajudar, mesmo quando não merecem. **Quem precisa da sua amabilidade hoje?**' },
            { day: 6, title: 'Bondade', passage: 'Gálatas 5:22', content: 'Refere-se à integridade e retidão de caráter. É ser uma pessoa boa e generosa, que reflete a natureza de Deus. **Tome uma decisão hoje que reflita a bondade de Deus.**' },
            { day: 7, title: 'Fidelidade', passage: 'Gálatas 5:22', content: 'Ser fiel é ser confiável e leal a Deus, à Sua Palavra e aos nossos compromissos. **Em que área Deus te chama a ser mais fiel?**' },
            { day: 8, title: 'Mansidão', passage: 'Gálatas 5:23', content: 'Mansidão não é fraqueza, mas força sob controle. É a humildade de submeter nossa vontade à de Deus e tratar os outros com gentileza. **Responda com mansidão em uma situação difícil hoje.**' },
            { day: 9, title: 'Domínio Próprio', passage: 'Gálatas 5:23', content: 'É o controle que o Espírito nos dá sobre nossos desejos, pensamentos e ações. É a disciplina para dizer "não" à carne e "sim" a Deus. **Em que área você precisa de mais domínio próprio?**' },
        ]
    }
];

export const mockUserReadingPlanProgress: UserReadingPlanProgress[] = [
    {
        userId: 'user-ana-sofia',
        planId: 'plan-salmo-23',
        completedDays: [1, 2, 3]
    },
    {
        userId: 'user-beatriz-costa',
        planId: 'plan-fruto-espirito',
        completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
     {
        userId: 'user-beatriz-costa',
        planId: 'plan-salmo-23',
        completedDays: [1]
    }
];