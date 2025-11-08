// FIX: Replaced incorrect file content with proper type definitions to resolve circular dependencies and export errors.

export type Page = 
  'landing' | 'login' | 'signup' | 'home' | 'profile' | 
  'devotionals' | 'studies' | 'lives' | 'podcasts' | 'prayers' |
  'challenges' | 'mentorships' | 'contentDetail' | 'testimonials' |
  'testimonialDetail' | 'publishTestimonial' | 'admin' |
  'readingPlans' | 'planDetail' | 'events' | 'eventDetail' | 'myGarden';

export type Role = 'aluna' | 'mentora' | 'mod' | 'admin';

export interface Reaction {
  userId: string;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  body: string;
  author: Author;
  createdAt: string;
  reactions: Reaction[];
}

export type ContentType = 'Devocional' | 'Estudo' | 'Podcast' | 'Live' | 'Mentoria';

export interface DownloadableResource {
  url: string;
  label?: string;
}

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
  actionUrl?: string; // For Lives, Mentorships (e.g., youtube link)
  createdAt?: string;
  comments: Comment[];
  reactions: Reaction[];
  progress?: number;
  total?: number;
  tags?: string[];
  duration?: number; // for podcasts, in seconds
  downloadableResource?: DownloadableResource;
}

export interface CommunityPost {
  id: string;
  room: 'testemunhos' | 'oracao' | 'estudos';
  title: string;
  body: string;
  author: Author;
  imageUrl?: string;
  isAnonymous?: boolean;
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
  savedBy?: string[];
  prayedBy?: string[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readBy: string[];
}

export interface UserPlaylist {
  id: string;
  name: string;
  contentIds: string[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: Role;
  status: 'active' | 'blocked';
  completedContentIds: string[];
  bio: string;
  cidade: string;
  igreja: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  points: number;
  level: string;
  achievements: string[];
  notificationSettings: {
    commentsOnMyPost: boolean;
    newLives: boolean;
    newPodcasts: boolean;
  };
  playlists: UserPlaylist[];
  dailyStreak: number;
  lastLoginDate: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  status: 'upcoming' | 'live' | 'past';
  scheduledAt: string;
  reactions: Reaction[];
  comments: Comment[];
  createdBy?: string;
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

export interface LogoSettings {
    displayMode: 'image-with-text' | 'image-only' | 'text-only';
    lightThemeUrl?: string;
    darkThemeUrl?: string;
    siteTitle?: string;
}

export interface FontSettings {
    headingFont: string;
    bodyFont: string;
}

export interface ThemeColors {
    lightBg: string;
    lightComponentBg: string;
    lightText: string;
    darkComponentBg: string;
    darkBg: string;
    accent: string;
}

export interface AppearanceSettings {
  heroData?: {
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
  logoSettings?: LogoSettings;
  fontSettings?: FontSettings;
  faviconUrl?: string;
  themeColors?: ThemeColors;
  useBackgroundImage?: boolean;
  backgroundImageUrl?: string;
}

export interface Category {
  name: string;
  filter: string;
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
    price: number;
    attendeeIds: string[];
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

export interface JournalEntry {
    id: string;
    userId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    relatedContentId?: string;
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

export interface PodcastEpisode {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl: string;
    duration: number; // in seconds
    createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or identifier
}

export interface Mission {
  id: string;
  title: string;
  points: number;
}