
export type Page = 'login' | 'signup' | 'landing' | 'home' | 'profile' | 'devotionals' | 'studies' | 'lives' | 'podcasts' | 'prayers' | 'challenges' | 'mentorships' | 'contentDetail' | 'testimonials' | 'testimonialDetail' | 'publishTestimonial' | 'admin' | 'readingPlans' | 'planDetail' | 'events' | 'eventDetail' | 'journal' | 'myGarden';

export type Role = 'aluna' | 'mentora' | 'mod' | 'admin';

export interface UserPlaylist {
  id: string;
  name: string;
  contentIds: string[];
}

export interface UserNotificationSettings {
  commentsOnMyPost: boolean;
  newLives: boolean;
  newPodcasts: boolean;
  newDevotionals: boolean;
  newPrayerRequests: boolean;
  newStudies: boolean;
  newMentorships: boolean;
  newTestimonials: boolean;
  newReadingPlans: boolean;
  newEvents: boolean;
  pushNotificationsEnabled: boolean;
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
  completedContentIds: string[];
  createdAt?: any;
  notificationSettings: UserNotificationSettings;
  playlists: UserPlaylist[];
  
  // Gamification: "Jardim Secreto"
  experience: number;
  gardenLevel: number;
  gardenLevelName: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO Date string
  unlockedAchievementIds: string[];
}

export interface Achievement {
  id: string;
  nome: string;
  desc: string;
  icone: string;
  verso: string;
  requisito?: { tipo: string; count: number };
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
  author: { id: string; fullName: string; avatarUrl: string };
  createdAt: string;
  reactions: { userId: string }[];
}

export interface CommunityPost {
  id: string;
  room: 'testemunhos' | 'oracao' | 'estudos';
  title: string;
  body: string;
  imageUrl?: string;
  authorId: string; // Foreign key to profiles table
  author?: { id: string; fullName: string; avatarUrl: string }; // Populated by a JOIN query
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
  audioUrl?: string;
}

export interface ThemeColors {
  lightBg: string; // creme-velado
  lightComponentBg: string; // branco-nevoa
  lightText: string; // marrom-seiva
  darkComponentBg: string; // verde-mata
  darkBg: string; // verde-escuro-profundo
  lightAccent: string; // dourado-suave (light mode)
  darkAccent: string; // dourado-suave (dark mode)
  lightButtonBg: string;
  lightButtonText: string;
  darkButtonBg: string;
  darkButtonText: string;
}

export interface AppearanceSettings {
  isAiDevotionalEnabled: boolean;
  aiDevotionalScheduleTime: string;
  dailyDevotional?: {
      date: string;
      content: GeneratedDevotional;
  };
  faviconUrl?: string;
  themeColors?: ThemeColors;
  useBackgroundImage?: boolean;
  backgroundImageUrlLight?: string;
  backgroundImageUrlDark?: string;
  componentBackgroundImageUrlLight?: string;
  componentBackgroundImageUrlDark?: string;
  logoSettings?: {
    siteTitle?: string;
    logoLightUrl?: string;
    logoDarkUrl?: string;
    logoDisplayMode?: 'image-only' | 'image-and-text';
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


export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'system' | 'reminder' | 'message' | string;
  read?: boolean;
  createdAt?: string; // ou Date, se preferir
}
