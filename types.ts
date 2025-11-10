
export type Page = 'login' | 'signup' | 'landing' | 'home' | 'profile' | 'devotionals' | 'studies' | 'lives' | 'podcasts' | 'prayers' | 'challenges' | 'mentorships' | 'contentDetail' | 'testimonials' | 'testimonialDetail' | 'publishTestimonial' | 'admin' | 'readingPlans' | 'planDetail' | 'events' | 'eventDetail' | 'journal' | 'myGarden';

export type Role = 'aluna' | 'mentora' | 'mod' | 'admin';

export type UserLevel = 'Iniciante da Fé' | 'Aprendiz da Palavra' | 'Guerreira de Oração' | 'Mentora de Fé';

export interface UserPlaylist {
  id: string;
  name: string;
  contentIds: string[];
}

export interface UserNotificationSettings {
  commentsOnMyPost: boolean;
  newLives: boolean;
  newPodcasts: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: Role;
  biography: string;
  cidade: string;
  igreja: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  points: number;
  level: UserLevel;
  completedContentIds: string[];
  createdAt?: any;
  achievements: string[];
  notificationSettings: UserNotificationSettings;
  playlists: UserPlaylist[];
}

export type ContentType = 'Devocional' | 'Live' | 'Podcast' | 'Estudo' | 'Mentoria';

export interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  type: ContentType;
  badge?: string;
  contentBody?: string;
  audioUrl?: string;
  actionUrl?: string; // Usado para vídeo do YouTube
  progress?: number;
  total?: number;
  tags?: string[];
  duration?: number;
  createdAt?: string;
  // Novas propriedades para interatividade
  comments: Comment[];
  reactions: { userId: string }[];
  downloadableResource?: {
    url: string;
    label?: string;
  };
}

export interface Comment {
  id: string;
  body: string;
  author: { id: string; name: string; avatarUrl: string };
  createdAt: string;
  reactions: { userId: string }[];
}

export interface CommunityPost {
  id: string;
  room: 'testemunhos' | 'oracao' | 'estudos';
  title: string;
  body: string;
  imageUrl?: string;
  author: { id: string; name: string; avatarUrl: string };
  reactions: { userId: string }[];
  comments: Comment[];
  createdAt: string;
  isAnonymous?: boolean;
  savedBy?: string[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readBy: string[];
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  status: 'upcoming' | 'live' | 'past';
  scheduledAt: string;
  createdBy?: string;
  reactions: { userId: string }[];
  comments: Comment[];
}

export interface GeneratedDevotional {
  title: string;
  verseReference: string;
  context: string;
  reflection: string;
  application: string[];
  prayer: string;
  weeklyChallenge: string;
  journalPrompts: string[];
  keywords: string[];
}

export interface ThemeColors {
  lightBg: string; // creme-velado
  lightComponentBg: string; // branco-nevoa
  lightText: string; // marrom-seiva
  darkComponentBg: string; // verde-mata
  darkBg: string; // verde-escuro-profundo
  accent: string; // dourado-suave
}

export interface AppearanceSettings {
  heroData: {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
  };
  isAiDevotionalEnabled: boolean;
  aiDevotionalScheduleTime: string;
  dailyDevotional?: {
      date: string;
      content: GeneratedDevotional;
  };
  siteTitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColors?: ThemeColors;
  useBackgroundImage?: boolean;
  backgroundImageUrl?: string;
  logoSettings?: {
    siteTitle?: string;
  };
  fontSettings?: {
    headingFont: string;
    bodyFont: string;
  };
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    points: number;
    createdAt: string;
    theme?: string;
    sequenceOrder?: number;
}

export interface UserChallengeCompletion {
    id: string;
    userId: string;
    challengeId: string;
    completedAt: string;
}

export interface ReadingPlanDay {
  day: number;
  title: string;
  passage: string;
  content: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  durationDays: number;
  days: ReadingPlanDay[];
}

export interface UserReadingPlanProgress {
  userId: string;
  planId: string;
  completedDays: number[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  attendeeIds: string[];
  price: number;
}

export interface PodcastEpisode {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl: string;
    duration: number; // in seconds
    createdAt: string;
}

export interface Category {
  name: string;
  filter: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  relatedContentId?: string; // ID of devotional, plan, etc.
  relatedContentTitle?: string;
}

export interface Announcement {
  id: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  createdAt: string;
}