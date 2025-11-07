export type Role = 'aluna' | 'mentora' | 'mod' | 'admin';

export type Page =
  | 'home'
  | 'devotionals'
  | 'studies'
  | 'mentorship'
  | 'prayers'
  | 'lives'
  | 'podcasts'
  | 'profile'
  | 'admin'
  | 'login'
  | 'signup'
  | 'contentDetail'
  // FIX: Added 'testimonials' to the Page type union to allow navigation.
  | 'testimonials'
  | 'testimonialDetail'
  | 'publishTestimonial'
  | 'readingPlans'
  | 'planDetail'
  // FIX: Added 'challenges' to the Page type union to fix a type error in App.tsx.
  | 'challenges'
  | 'landing';

export type ContentType = 'Devocional' | 'Mentoria' | 'Live' | 'Podcast' | 'Estudo';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: Role;
  bio?: string;
  cidade?: string;
  igreja?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
  completedContentIds: string[];
  points: number;
  level: string;
}

export interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  type: ContentType;
  badge?: string;
  progress?: number;
  total?: number;
  contentBody?: string;
  audioUrl?: string;
  actionUrl?: string;
  duration?: number;
  createdAt?: string;
}

export interface Category {
  name: string;
  filter: string;
}

export interface Comment {
  id: string;
  body: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface Reaction {
  userId: string;
}

export interface CommunityPost {
  id: string;
  room: 'testemunhos' | 'oracao' | 'estudos' | 'mentoria';
  title: string;
  body: string;
  imageUrl?: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
  savedBy?: string[];
  isAnonymous?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readBy: string[];
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
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  status: 'upcoming' | 'live' | 'past';
  scheduledAt: string;
  createdBy?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  createdAt: string;
}

export interface UserChallengeCompletion {
  id: string;
  userId: string;
  challengeId: string;
  completedAt: string;
}


export interface ReadingPlan {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    durationDays: number;
    days: ReadingPlanDay[];
}

export interface ReadingPlanDay {
    day: number;
    title: string;
    passage: string;
    content: string; // Markdown or HTML
}

export interface UserReadingPlanProgress {
    userId: string;
    planId: string;
    completedDays: number[];
}

export interface PodcastEpisode {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl: string;
    duration: number;
    createdAt: string;
}