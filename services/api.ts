import {
  User,
  ContentItem,
  CommunityPost,
  Notification,
  Role,
  LiveSession,
  AppearanceSettings,
  Challenge,
  UserChallengeCompletion,
  Comment,
  ReadingPlan,
  UserReadingPlanProgress
} from '../types';
import {
  mockUsers,
  mockContent,
  mockCommunityPosts,
  mockNotifications,
  mockLiveSessions,
  mockReadingPlans,
  mockUserReadingPlanProgress
} from '../data/mockData';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Simulate API latency
const apiDelay = 500;

// Mocks that don't exist in mockData
let mockChallenges: Challenge[] = [
    { id: 'c1', title: 'Leia 1 capítulo da Bíblia', description: 'Escolha qualquer livro da Bíblia e leia um capítulo hoje.', points: 10, createdAt: new Date().toISOString() },
    { id: 'c2', title: 'Ore por 5 minutos', description: 'Separe um tempo para conversar com Deus sobre o seu dia.', points: 15, createdAt: new Date().toISOString() },
    { id: 'c3', title: 'Compartilhe um versículo', description: 'Envie um versículo que te tocou para uma amiga.', points: 20, createdAt: new Date().toISOString() },
];
let mockUserChallengeCompletions: UserChallengeCompletion[] = [];
let mockAppearanceSettings: AppearanceSettings = {
    heroData: {
        title: "Jornada da Fé",
        subtitle: "Devocional Diário",
        description: "Comece seu dia com uma reflexão poderosa para fortalecer seu espírito e guiar seus passos.",
        imageUrl: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    isAiDevotionalEnabled: true,
    aiDevotionalScheduleTime: '06:00',
};

// --- User API ---
export const getUserProfile = async (userId: string): Promise<User | null> => {
    // In a real app, this would fetch from Firestore.
    // For now, it finds in mock data.
    const user = mockUsers.find(u => u.id === userId);
    if (user) return user;
    
    // Fallback to firestore for auth user
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUsers), apiDelay));
};

export const updateUserRole = async (userId: string, role: Role): Promise<void> => {
    return new Promise(resolve => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            mockUsers[userIndex].role = role;
        }
        setTimeout(resolve, apiDelay);
    });
};

// --- Content API ---
export const getAllContent = async (): Promise<ContentItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockContent), apiDelay));
};

export const getContentItem = async (id: string): Promise<ContentItem | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockContent.find(item => item.id === id)), apiDelay));
};

export const getDevotionals = async (): Promise<ContentItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockContent.filter(c => c.type === 'Devocional')), apiDelay));
};

export const getMentorships = async (): Promise<ContentItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockContent.filter(c => c.type === 'Mentoria')), apiDelay));
};

export const getPodcastEpisodes = async (): Promise<ContentItem[]> => {
     const podcasts = mockContent.filter(c => c.type === 'Podcast');
     return new Promise(resolve => setTimeout(() => resolve(podcasts), apiDelay));
};

export const createContentItem = async (item: Omit<ContentItem, 'id'|'createdAt'>): Promise<ContentItem> => {
    return new Promise(resolve => {
        const newItem: ContentItem = {
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            ...item
        };
        mockContent.unshift(newItem);
        setTimeout(() => resolve(newItem), apiDelay);
    });
}

export const updateContentItem = async (item: ContentItem): Promise<ContentItem> => {
     return new Promise((resolve, reject) => {
        const index = mockContent.findIndex(c => c.id === item.id);
        if (index > -1) {
            mockContent[index] = item;
            setTimeout(() => resolve(item), apiDelay);
        } else {
            reject(new Error("Content not found"));
        }
    });
}

export const deleteContentItem = async (id: string): Promise<void> => {
     return new Promise(resolve => {
        const index = mockContent.findIndex(c => c.id === id);
        if (index > -1) {
            mockContent.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
}


// --- Community API ---
export const getCommunityPosts = async (room: 'testemunhos' | 'oracao' | 'estudos' | 'mentoria'): Promise<CommunityPost[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.filter(p => p.room === room).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), apiDelay));
};

export const getAllCommunityPostsForAdmin = async (): Promise<CommunityPost[]> => {
     return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), apiDelay));
}

export const getCommunityPostById = async (id: string): Promise<CommunityPost | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.find(p => p.id === id)), apiDelay));
}

export const createCommunityPost = async (postData: { room: string; title: string; body: string; authorId: string; imageUrl?: string; isAnonymous?: boolean }): Promise<void> => {
    const author = mockUsers.find(u => u.id === postData.authorId);
    if (!author) return Promise.reject("Author not found");
    const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        room: postData.room as 'testemunhos' | 'oracao' | 'estudos' | 'mentoria',
        title: postData.title,
        body: postData.body,
        author: { id: author.id, name: author.displayName, avatarUrl: author.avatarUrl },
        reactions: [],
        comments: [],
        createdAt: new Date().toISOString(),
        imageUrl: postData.imageUrl,
        isAnonymous: postData.isAnonymous
    };
    mockCommunityPosts.unshift(newPost);
    return new Promise(resolve => setTimeout(resolve, apiDelay));
}

export const updateCommunityPost = async (postId: string, data: Partial<CommunityPost>): Promise<void> => {
    return new Promise((resolve, reject) => {
        const postIndex = mockCommunityPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            mockCommunityPosts[postIndex] = { ...mockCommunityPosts[postIndex], ...data };
            setTimeout(resolve, apiDelay);
        } else {
            reject(new Error('Post not found'));
        }
    });
}

export const deleteCommunityPost = async (postId: string): Promise<void> => {
    return new Promise(resolve => {
        const index = mockCommunityPosts.findIndex(p => p.id === postId);
        if(index > -1) {
            mockCommunityPosts.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
}


export const addReactionToPost = async (postId: string, userId: string): Promise<void> => {
    return new Promise(resolve => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        if (post) {
            const reactionIndex = post.reactions.findIndex(r => r.userId === userId);
            if (reactionIndex > -1) {
                post.reactions.splice(reactionIndex, 1);
            } else {
                post.reactions.push({ userId });
            }
        }
        setTimeout(resolve, apiDelay);
    });
};

export const addCommentToPost = async (postId: string, body: string, user: User): Promise<void> => {
     return new Promise(resolve => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        if (post) {
            const newComment: Comment = {
                id: `c-${Date.now()}`,
                body,
                author: { id: user.id, name: user.displayName, avatarUrl: user.avatarUrl },
                createdAt: new Date().toISOString()
            };
            post.comments.push(newComment);
        }
        setTimeout(resolve, apiDelay);
    });
}

export const deleteCommentFromPost = async (postId: string, commentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        if (post) {
            const commentIndex = post.comments.findIndex(c => c.id === commentId);
            if (commentIndex > -1) {
                post.comments.splice(commentIndex, 1);
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Post not found'));
        }
    });
}

export const saveTestimonial = async (postId: string, userId: string): Promise<void> => {
    return new Promise(resolve => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        if (post) {
            if(!post.savedBy) post.savedBy = [];
            const saveIndex = post.savedBy.findIndex(uid => uid === userId);
            if (saveIndex > -1) {
                post.savedBy.splice(saveIndex, 1);
            } else {
                post.savedBy.push(userId);
            }
        }
        setTimeout(resolve, apiDelay);
    });
}


// --- Notifications API ---
export const getNotifications = async (): Promise<Notification[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockNotifications), apiDelay));
};

export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
    return new Promise(resolve => {
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification && !notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
        }
        setTimeout(resolve, apiDelay);
    });
}

// --- Live Sessions API ---
export const getLiveSessions = async (): Promise<LiveSession[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockLiveSessions), apiDelay));
}

export const createLiveSession = async (session: Omit<LiveSession, 'id'>): Promise<void> => {
    const newSession: LiveSession = { id: `live-${Date.now()}`, ...session };
    mockLiveSessions.push(newSession);
    return new Promise(resolve => setTimeout(resolve, apiDelay));
}

export const updateLiveSession = async (sessionId: string, data: Partial<LiveSession>): Promise<void> => {
     return new Promise(resolve => {
        const index = mockLiveSessions.findIndex(s => s.id === sessionId);
        if (index > -1) {
            mockLiveSessions[index] = { ...mockLiveSessions[index], ...data };
        }
        setTimeout(resolve, apiDelay);
    });
}

export const deleteLiveSession = async (sessionId: string): Promise<void> => {
     return new Promise(resolve => {
        const index = mockLiveSessions.findIndex(s => s.id === sessionId);
        if (index > -1) {
            mockLiveSessions.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
}


// --- Appearance API ---
export const getAppearanceSettings = async (): Promise<AppearanceSettings> => {
    return new Promise(resolve => setTimeout(() => resolve(mockAppearanceSettings), apiDelay));
}

export const updateAppearanceSettings = async (settings: Partial<AppearanceSettings>): Promise<void> => {
    return new Promise(resolve => {
        mockAppearanceSettings = { ...mockAppearanceSettings, ...settings };
        setTimeout(resolve, apiDelay);
    });
}

// --- Content Completion API ---
export const markContentAsComplete = async (userId: string, contentId: string): Promise<void> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        if(user && !user.completedContentIds.includes(contentId)) {
            user.completedContentIds.push(contentId);
        }
        setTimeout(resolve, apiDelay);
    });
}

export const unmarkContentAsComplete = async (userId: string, contentId: string): Promise<void> => {
     return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        if(user) {
            user.completedContentIds = user.completedContentIds.filter(id => id !== contentId);
        }
        setTimeout(resolve, apiDelay);
    });
}

// --- Challenges API ---
export const getChallenges = async (): Promise<Challenge[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockChallenges), apiDelay));
}
export const createChallenge = async (challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<void> => {
    const newChallenge: Challenge = { id: `chall-${Date.now()}`, createdAt: new Date().toISOString(), ...challenge };
    mockChallenges.push(newChallenge);
    return new Promise(resolve => setTimeout(resolve, apiDelay));
}
export const updateChallenge = async (challengeId: string, data: Partial<Challenge>): Promise<void> => {
     return new Promise(resolve => {
        const index = mockChallenges.findIndex(c => c.id === challengeId);
        if (index > -1) {
            mockChallenges[index] = { ...mockChallenges[index], ...data };
        }
        setTimeout(resolve, apiDelay);
    });
}
export const deleteChallenge = async (challengeId: string): Promise<void> => {
     return new Promise(resolve => {
        const index = mockChallenges.findIndex(c => c.id === challengeId);
        if (index > -1) {
            mockChallenges.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
}

export const getUserChallengeCompletions = async (userId: string): Promise<UserChallengeCompletion[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUserChallengeCompletions.filter(c => c.userId === userId)), apiDelay));
}

export const completeChallenge = async (userId: string, challengeId: string, points: number): Promise<void> => {
     return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        const alreadyCompleted = mockUserChallengeCompletions.some(c => c.userId === userId && c.challengeId === challengeId);
        if (user && !alreadyCompleted) {
            user.points += points;
            mockUserChallengeCompletions.push({
                id: `comp-${Date.now()}`,
                userId,
                challengeId,
                completedAt: new Date().toISOString()
            });
        }
        setTimeout(resolve, apiDelay);
    });
}

// --- Reading Plans API (mock) ---
export const getReadingPlans = async (): Promise<ReadingPlan[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockReadingPlans), apiDelay));
}

export const getReadingPlanById = async (id: string): Promise<ReadingPlan | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockReadingPlans.find(p => p.id === id)), apiDelay));
}

export const getAllUserReadingProgress = async (userId: string): Promise<UserReadingPlanProgress[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUserReadingPlanProgress.filter(p => p.userId === userId)), apiDelay));
}

export const getUserReadingPlanProgressForPlan = async (userId: string, planId: string): Promise<UserReadingPlanProgress | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUserReadingPlanProgress.find(p => p.userId === userId && p.planId === planId)), apiDelay));
}

export const updateUserReadingPlanProgress = async (userId: string, planId: string, completedDays: number[]): Promise<void> => {
    return new Promise(resolve => {
        const progressIndex = mockUserReadingPlanProgress.findIndex(p => p.userId === userId && p.planId === planId);
        if (progressIndex > -1) {
            mockUserReadingPlanProgress[progressIndex].completedDays = completedDays;
        } else {
            mockUserReadingPlanProgress.push({ userId, planId, completedDays });
        }
        setTimeout(resolve, apiDelay);
    });
}