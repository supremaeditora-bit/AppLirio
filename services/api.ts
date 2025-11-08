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
  UserReadingPlanProgress,
  Event,
  JournalEntry,
  Announcement,
  Achievement,
  Mission
} from '../types';
import {
  mockUsers,
  mockContent,
  mockCommunityPosts,
  mockNotifications,
  mockLiveSessions,
  mockReadingPlans,
  mockUserReadingPlanProgress,
  mockEvents,
  mockChallenges,
  mockUserChallengeCompletions,
  mockJournalEntries,
  mockAnnouncements,
  mockAchievements,
  mockMissions
} from '../data/mockData';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { POINTS_AWARD } from './gamificationConstants';

// Simulate API latency
const apiDelay = 500;


let mockAppearanceSettings: AppearanceSettings = {
    heroData: {
        title: "Jornada da Fé",
        subtitle: "Devocional Diário",
        description: "Comece seu dia com uma reflexão poderosa para fortalecer seu espírito e guiar seus passos.",
        imageUrl: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    isAiDevotionalEnabled: true,
    aiDevotionalScheduleTime: '06:00',
    logoSettings: {
      displayMode: 'image-with-text',
      lightThemeUrl: '',
      darkThemeUrl: '',
      siteTitle: 'ELV | Assistente Espiritual'
    },
    fontSettings: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
    },
    faviconUrl: '/favicon.ico',
    themeColors: {
      lightBg: '#FBF8F1',
      lightComponentBg: '#FAF9F6',
      lightText: '#5C3D2E',
      darkComponentBg: '#2C3E2A',
      darkBg: '#1A2918',
      accent: '#C0A063',
    },
    useBackgroundImage: false,
    backgroundImageUrl: '',
};

// --- Gamification Helper ---
export const awardAchievement = (userId: string, achievementId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user && !user.achievements.includes(achievementId)) {
        user.achievements.push(achievementId);
        // Maybe create a notification here in the future
    }
};

// FIX: Added and exported handleDailyLogin function to fix missing export error in App.tsx
export const handleDailyLogin = async (userId: string): Promise<User> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = user.lastLoginDate;

            if (lastLogin !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                let awardedPoints = POINTS_AWARD.DAILY_LOGIN;
                let newStreak = user.dailyStreak;

                if (lastLogin === yesterday) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }
                
                if (newStreak === 3) awardedPoints += POINTS_AWARD.STREAK_3_DAYS;
                if (newStreak === 7) {
                    awardedPoints += POINTS_AWARD.STREAK_7_DAYS;
                    awardAchievement(user.id, 'SEMPRE_FIEL');
                }

                user.points += awardedPoints;
                user.dailyStreak = newStreak;
                user.lastLoginDate = today;
            }
        }
        setTimeout(() => resolve(user!), 100);
    });
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

export const updateUserStatus = async (userId: string, status: 'active' | 'blocked'): Promise<void> => {
    return new Promise(resolve => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            mockUsers[userIndex].status = status;
        }
        setTimeout(resolve, apiDelay);
    });
};

export const deleteUser = async (userId: string): Promise<void> => {
    return new Promise(resolve => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            mockUsers.splice(userIndex, 1);
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

export const createContentItem = async (item: Omit<ContentItem, 'id'|'createdAt'|'comments'|'reactions'>): Promise<ContentItem> => {
    return new Promise(resolve => {
        const newItem: ContentItem = {
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            comments: [],
            reactions: [],
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

export const addReactionToContent = async (contentId: string, userId: string): Promise<void> => {
    return new Promise(resolve => {
        const content = mockContent.find(p => p.id === contentId);
        if (content) {
            const reactionIndex = content.reactions.findIndex(r => r.userId === userId);
            if (reactionIndex > -1) {
                content.reactions.splice(reactionIndex, 1);
            } else {
                content.reactions.push({ userId });
            }
        }
        setTimeout(resolve, apiDelay);
    });
};

// FIX: Modified function to award points and return the updated user.
export const addCommentToContent = async (contentId: string, body: string, user: User): Promise<User> => {
     return new Promise(resolve => {
        const content = mockContent.find(p => p.id === contentId);
        let userToUpdate = mockUsers.find(u => u.id === user.id);
        if (content && userToUpdate) {
            const newComment: Comment = {
                id: `c-content-${Date.now()}`,
                body,
                author: { id: user.id, name: user.displayName, avatarUrl: user.avatarUrl },
                createdAt: new Date().toISOString(),
                reactions: []
            };
            content.comments.push(newComment);
            userToUpdate.points += POINTS_AWARD.POST_COMMENT;
        }
        setTimeout(() => resolve(userToUpdate!), apiDelay);
    });
}

export const addReactionToContentComment = async (contentId: string, commentId: string, userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const content = mockContent.find(p => p.id === contentId);
        if (content) {
            const comment = content.comments.find(c => c.id === commentId);
            if (comment) {
                if (!comment.reactions) comment.reactions = [];
                const reactionIndex = comment.reactions.findIndex(r => r.userId === userId);
                if (reactionIndex > -1) {
                    comment.reactions.splice(reactionIndex, 1);
                } else {
                    comment.reactions.push({ userId });
                }
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Content not found'));
        }
    });
};

export const deleteCommentFromContent = async (contentId: string, commentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const content = mockContent.find(p => p.id === contentId);
        if (content) {
            const commentIndex = content.comments.findIndex(c => c.id === commentId);
            if (commentIndex > -1) {
                content.comments.splice(commentIndex, 1);
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Content not found'));
        }
    });
}


// --- Community API ---
export const getCommunityPosts = async (room: 'testemunhos' | 'oracao' | 'estudos'): Promise<CommunityPost[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.filter(p => p.room === room).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), apiDelay));
};

export const getAllCommunityPostsForAdmin = async (): Promise<CommunityPost[]> => {
     return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), apiDelay));
}

export const getCommunityPostById = async (id: string): Promise<CommunityPost | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCommunityPosts.find(p => p.id === id)), apiDelay));
}

// FIX: Modified function to award points/achievements and return the updated user.
export const createCommunityPost = async (postData: { room: string; title: string; body: string; authorId: string; imageUrl?: string; isAnonymous?: boolean }): Promise<User> => {
    const author = mockUsers.find(u => u.id === postData.authorId);
    if (!author) return Promise.reject("Author not found");
    const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        room: postData.room as 'testemunhos' | 'oracao' | 'estudos',
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
    let points = 0;
    if (newPost.room === 'testemunhos') {
        awardAchievement(author.id, 'VOZ_DA_FE');
        points = POINTS_AWARD.POST_TESTIMONIAL;
    } else if (newPost.room === 'oracao') {
        awardAchievement(author.id, 'PRIMEIRA_ORACAO');
        points = POINTS_AWARD.POST_PRAYER;
    }
    author.points += points;

    return new Promise(resolve => setTimeout(() => resolve(author), apiDelay));
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

// FIX: Modified function to award points and return the updated user.
export const addCommentToPost = async (postId: string, body: string, user: User): Promise<User> => {
     return new Promise(resolve => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        const userToUpdate = mockUsers.find(u => u.id === user.id);
        if (post && userToUpdate) {
            const newComment: Comment = {
                id: `c-${Date.now()}`,
                body,
                author: { id: user.id, name: user.displayName, avatarUrl: user.avatarUrl },
                createdAt: new Date().toISOString(),
                reactions: []
            };
            post.comments.push(newComment);
            userToUpdate.points += POINTS_AWARD.POST_COMMENT;

            // --- NOTIFICATION LOGIC ---
            const userIdsToNotify = new Set<string>();
            
            // Notify post author if they want notifications
            const postAuthor = mockUsers.find(u => u.id === post.author.id);
            if (postAuthor && postAuthor.id !== user.id && postAuthor.notificationSettings.commentsOnMyPost) {
                userIdsToNotify.add(postAuthor.id);
            }

            // Notify other commenters if they want notifications
            post.comments.forEach(comment => {
                const commenter = mockUsers.find(u => u.id === comment.author.id);
                if (commenter && commenter.id !== user.id && commenter.notificationSettings.commentsOnMyPost) {
                     userIdsToNotify.add(commenter.id);
                }
            });

            const notificationBody = body.length > 100 ? `${body.substring(0, 97)}...` : body;

            userIdsToNotify.forEach(userId => {
                const newNotification: Notification = {
                    id: `n-${Date.now()}-${Math.random()}`,
                    title: `${user.displayName} respondeu em "${post.title}"`,
                    body: notificationBody,
                    createdAt: new Date().toISOString(),
                    readBy: [],
                };
                mockNotifications.unshift(newNotification);
            });
            // --- END NOTIFICATION LOGIC ---
        }
        setTimeout(() => resolve(userToUpdate!), apiDelay);
    });
}

export const addReactionToComment = async (postId: string, commentId: string, userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                if (!comment.reactions) {
                    comment.reactions = [];
                }
                const reactionIndex = comment.reactions.findIndex(r => r.userId === userId);
                if (reactionIndex > -1) {
                    comment.reactions.splice(reactionIndex, 1); // Unlike
                } else {
                    comment.reactions.push({ userId }); // Like
                }
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Post not found'));
        }
    });
};

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

// FIX: Added and exported `prayForPost` function.
export const prayForPost = async (postId: string, userId: string): Promise<User> => {
    return new Promise(resolve => {
        const post = mockCommunityPosts.find(p => p.id === postId);
        const user = mockUsers.find(u => u.id === userId);
        if (post && user) {
            if(!post.prayedBy) post.prayedBy = [];
            const prayIndex = post.prayedBy.findIndex(uid => uid === userId);
            if (prayIndex === -1) {
                post.prayedBy.push(userId);
                user.points += POINTS_AWARD.PRAY_FOR_SOMEONE;
                if(post.prayedBy.length >= 25) { 
                    awardAchievement(userId, 'CORACAO_INTERCESSOR');
                }
            }
        }
        setTimeout(() => resolve(user!), apiDelay);
    });
};

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
    const newSession: LiveSession = { id: `live-${Date.now()}`, reactions: [], comments: [], ...session };
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

export const addReactionToLiveSession = async (sessionId: string, userId: string): Promise<void> => {
    return new Promise(resolve => {
        const session = mockLiveSessions.find(s => s.id === sessionId);
        if (session) {
            const reactionIndex = session.reactions.findIndex(r => r.userId === userId);
            if (reactionIndex > -1) {
                session.reactions.splice(reactionIndex, 1);
            } else {
                session.reactions.push({ userId });
            }
        }
        setTimeout(resolve, apiDelay);
    });
};

export const addCommentToLiveSession = async (sessionId: string, body: string, user: User): Promise<void> => {
     return new Promise(resolve => {
        const session = mockLiveSessions.find(s => s.id === sessionId);
        if (session) {
            const newComment: Comment = {
                id: `lc-${Date.now()}`,
                body,
                author: { id: user.id, name: user.displayName, avatarUrl: user.avatarUrl },
                createdAt: new Date().toISOString(),
                reactions: []
            };
            session.comments.push(newComment);
        }
        setTimeout(resolve, apiDelay);
    });
}

export const addReactionToLiveComment = async (sessionId: string, commentId: string, userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const session = mockLiveSessions.find(s => s.id === sessionId);
        if (session) {
            const comment = session.comments.find(c => c.id === commentId);
            if (comment) {
                if (!comment.reactions) {
                    comment.reactions = [];
                }
                const reactionIndex = comment.reactions.findIndex(r => r.userId === userId);
                if (reactionIndex > -1) {
                    comment.reactions.splice(reactionIndex, 1);
                } else {
                    comment.reactions.push({ userId });
                }
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Session not found'));
        }
    });
};

export const deleteCommentFromLiveSession = async (sessionId: string, commentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const session = mockLiveSessions.find(s => s.id === sessionId);
        if (session) {
            const commentIndex = session.comments.findIndex(c => c.id === commentId);
            if (commentIndex > -1) {
                session.comments.splice(commentIndex, 1);
                setTimeout(resolve, apiDelay);
            } else {
                reject(new Error('Comment not found'));
            }
        } else {
            reject(new Error('Session not found'));
        }
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
// FIX: Modified function to return updated user for state management.
export const markContentAsComplete = async (userId: string, contentId: string): Promise<User> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId)!;
        if(!user.completedContentIds.includes(contentId)) {
            user.completedContentIds.push(contentId);
            user.points += POINTS_AWARD.COMPLETE_CONTENT;

            if (user.completedContentIds.length >= 10) {
                awardAchievement(userId, 'LEITORA_DEDICADA');
            }
             if (user.completedContentIds.length >= 5) {
                awardAchievement(userId, 'devotional_5');
            }
        }
        setTimeout(() => resolve(user), apiDelay);
    });
}

// FIX: Modified function to return updated user for state management.
export const unmarkContentAsComplete = async (userId: string, contentId: string): Promise<User> => {
     return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId)!;
        const wasCompleted = user.completedContentIds.includes(contentId);
        if(wasCompleted) {
            user.completedContentIds = user.completedContentIds.filter(id => id !== contentId);
            user.points = Math.max(0, user.points - POINTS_AWARD.COMPLETE_CONTENT);
        }
        setTimeout(() => resolve(user), apiDelay);
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
            awardAchievement(userId, 'first_challenge');
        }
        setTimeout(resolve, apiDelay);
    });
}

// --- Gamification API ---
// FIX: Added and exported `getAchievements` and `getMissions` to fix missing export errors.
export const getAchievements = async (): Promise<Achievement[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockAchievements), apiDelay));
}

export const getMissions = async (): Promise<Mission[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockMissions), apiDelay));
}


// --- Journal API ---
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockJournalEntries.filter(j => j.userId === userId).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())), apiDelay));
};

// FIX: Modified function to return new entry and updated user to fix destructuring error.
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<{newEntry: JournalEntry, updatedUser: User}> => {
    return new Promise(resolve => {
        const newEntry: JournalEntry = {
            id: `journal-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...entry
        };
        mockJournalEntries.unshift(newEntry);
        const user = mockUsers.find(u => u.id === entry.userId)!;
        user.points += POINTS_AWARD.WRITE_JOURNAL;
        awardAchievement(entry.userId, 'PAGINA_EM_BRANCO');
        setTimeout(() => resolve({newEntry, updatedUser: user}), apiDelay);
    });
};

export const updateJournalEntry = async (entryId: string, content: string, title: string): Promise<JournalEntry> => {
    return new Promise((resolve, reject) => {
        const index = mockJournalEntries.findIndex(j => j.id === entryId);
        if (index > -1) {
            mockJournalEntries[index] = { ...mockJournalEntries[index], content, title, updatedAt: new Date().toISOString() };
            setTimeout(() => resolve(mockJournalEntries[index]), apiDelay);
        } else {
            reject(new Error("Journal entry not found"));
        }
    });
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
    return new Promise(resolve => {
        const index = mockJournalEntries.findIndex(j => j.id === entryId);
        if (index > -1) {
            mockJournalEntries.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
};

// --- Playlist API ---
export const createPlaylist = async (userId: string, name: string): Promise<void> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            user.playlists.push({ id: `pl-${Date.now()}`, name, contentIds: [] });
        }
        setTimeout(resolve, apiDelay);
    });
};

export const addToPlaylist = async (userId: string, playlistId: string, contentId: string): Promise<void> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        const playlist = user?.playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.contentIds.includes(contentId)) {
            playlist.contentIds.push(contentId);
        }
        setTimeout(resolve, apiDelay);
    });
};

export const removeFromPlaylist = async (userId: string, playlistId: string, contentId: string): Promise<void> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        const playlist = user?.playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.contentIds = playlist.contentIds.filter(id => id !== contentId);
        }
        setTimeout(resolve, apiDelay);
    });
};

export const deletePlaylist = async (userId: string, playlistId: string): Promise<void> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            user.playlists = user.playlists.filter(p => p.id !== playlistId);
        }
        setTimeout(resolve, apiDelay);
    });
}

// --- Announcements API ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockAnnouncements.filter(a => a.isActive)), apiDelay));
};

export const getAllAnnouncementsForAdmin = async (): Promise<Announcement[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockAnnouncements), apiDelay));
}

export const createAnnouncement = async (ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> => {
    const newAnn: Announcement = { id: `ann-${Date.now()}`, createdAt: new Date().toISOString(), ...ann };
    mockAnnouncements.unshift(newAnn);
    return new Promise(resolve => setTimeout(resolve, apiDelay));
};

export const updateAnnouncement = async (annId: string, data: Partial<Announcement>): Promise<void> => {
    return new Promise(resolve => {
        const index = mockAnnouncements.findIndex(a => a.id === annId);
        if (index > -1) {
            mockAnnouncements[index] = { ...mockAnnouncements[index], ...data };
        }
        setTimeout(resolve, apiDelay);
    });
};


// --- Reading Plans API (mock) ---
export const getReadingPlans = async (): Promise<ReadingPlan[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockReadingPlans), apiDelay));
}

export const getReadingPlanById = async (id: string): Promise<ReadingPlan | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockReadingPlans.find(p => p.id === id)), apiDelay));
}

export const createReadingPlan = async (planData: Omit<ReadingPlan, 'id'>): Promise<ReadingPlan> => {
    return new Promise(resolve => {
        const newPlan: ReadingPlan = {
            id: `plan-${Date.now()}`,
            ...planData
        };
        mockReadingPlans.unshift(newPlan);
        setTimeout(() => resolve(newPlan), apiDelay);
    });
};

export const updateReadingPlan = async (planData: ReadingPlan): Promise<ReadingPlan> => {
    return new Promise((resolve, reject) => {
        const index = mockReadingPlans.findIndex(p => p.id === planData.id);
        if (index > -1) {
            mockReadingPlans[index] = planData;
            setTimeout(() => resolve(planData), apiDelay);
        } else {
            reject(new Error("Plan not found"));
        }
    });
};

export const deleteReadingPlan = async (planId: string): Promise<void> => {
    return new Promise(resolve => {
        const index = mockReadingPlans.findIndex(p => p.id === planId);
        if (index > -1) {
            mockReadingPlans.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
};

export const getAllUserReadingProgress = async (userId: string): Promise<UserReadingPlanProgress[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUserReadingPlanProgress.filter(p => p.userId === userId)), apiDelay));
}

export const getUserReadingPlanProgressForPlan = async (userId: string, planId: string): Promise<UserReadingPlanProgress | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUserReadingPlanProgress.find(p => p.userId === userId && p.planId === planId)), apiDelay));
}

// FIX: Modified function to accept `isPlanFinished` and return the updated user.
export const updateUserReadingPlanProgress = async (userId: string, planId: string, completedDays: number[], isPlanFinished: boolean): Promise<User> => {
    return new Promise(resolve => {
        const user = mockUsers.find(u => u.id === userId)!;
        user.points += POINTS_AWARD.COMPLETE_PLAN_DAY;
        if(isPlanFinished) {
            awardAchievement(userId, 'JORNADA_COMPLETA');
        }

        const progressIndex = mockUserReadingPlanProgress.findIndex(p => p.userId === userId && p.planId === planId);
        if (progressIndex > -1) {
            mockUserReadingPlanProgress[progressIndex].completedDays = completedDays;
        } else {
            mockUserReadingPlanProgress.push({ userId, planId, completedDays });
            awardAchievement(userId, 'SEMENTE_DA_PALAVRA');
        }
        setTimeout(() => resolve(user), apiDelay);
    });
}

// --- Events API ---
export const getEvents = async (): Promise<Event[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())), apiDelay));
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(mockEvents.find(e => e.id === id)), apiDelay));
};

// FIX: Modified function to award points and return the updated user.
export const registerForEvent = async (eventId: string, userId: string): Promise<User> => {
    return new Promise(resolve => {
        const event = mockEvents.find(e => e.id === eventId);
        const user = mockUsers.find(u => u.id === userId)!;
        if (event && !event.attendeeIds.includes(userId)) {
            event.attendeeIds.push(userId);
            user.points += POINTS_AWARD.REGISTER_EVENT;
        }
        setTimeout(() => resolve(user), apiDelay);
    });
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'attendeeIds'>): Promise<Event> => {
    return new Promise(resolve => {
        const newEvent: Event = {
            id: `evt-${Date.now()}`,
            attendeeIds: [],
            ...eventData
        };
        mockEvents.unshift(newEvent);
        setTimeout(() => resolve(newEvent), apiDelay);
    });
};

export const updateEvent = async (eventData: Event): Promise<Event> => {
    return new Promise((resolve, reject) => {
        const index = mockEvents.findIndex(e => e.id === eventData.id);
        if (index > -1) {
            mockEvents[index] = eventData;
            setTimeout(() => resolve(eventData), apiDelay);
        } else {
            reject(new Error("Event not found"));
        }
    });
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    return new Promise(resolve => {
        const index = mockEvents.findIndex(e => e.id === eventId);
        if (index > -1) {
            mockEvents.splice(index, 1);
        }
        setTimeout(resolve, apiDelay);
    });
};