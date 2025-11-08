// services/authService.ts

// This file is now a mock authentication service to align with the mock data layer.
// It simulates Firebase Auth behavior without making real API calls for email/password.

import { User as FirebaseUser } from 'firebase/auth'; 
import { User } from '../types';
import { mockUsers } from '../data/mockData';

// --- Mock Auth State ---
let currentMockUser: User | null = null;
// The listener callback expects a FirebaseUser-like object or null.
const listeners: ((user: FirebaseUser | null) => void)[] = [];

const notifyListeners = () => {
    let userToNotify: FirebaseUser | null = null;
    if (currentMockUser) {
        // Create a fake FirebaseUser object that has the properties our app uses (like `uid`).
        userToNotify = {
            uid: currentMockUser.id,
            email: currentMockUser.email,
            displayName: currentMockUser.displayName,
            photoURL: currentMockUser.avatarUrl,
        } as FirebaseUser;
    }
  listeners.forEach(cb => cb(userToNotify));
};

// --- Mock Auth Functions ---

export const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    // In a mock, we ignore the password and just find the user by email
    console.log("Attempting mock login for:", email);
    const user = mockUsers.find(u => u.email === email);
    if (user) {
        currentMockUser = user;
        notifyListeners();
        return Promise.resolve();
    } else {
        // Simulate Firebase's invalid credential error
        const error = new Error("Invalid login credentials");
        (error as any).code = 'auth/invalid-credential';
        return Promise.reject(error);
    }
};

export const loginWithGoogle = async (): Promise<void> => {
    // Mock Google login to log in as the first user (Ana Sofia)
    currentMockUser = mockUsers[0];
    notifyListeners();
    return Promise.resolve();
}

export const signupWithEmail = async (displayName: string, email: string, pass: string): Promise<void> => {
     const existing = mockUsers.find(u => u.email === email);
     if (existing) {
         throw new Error("User already registered");
     }
     const newUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        displayName: displayName,
        avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName || 'U')}`,
        role: 'aluna',
        status: 'active',
        completedContentIds: [],
        bio: '',
        cidade: '',
        igreja: '',
        socialLinks: {},
        points: 0,
        level: 'Terra Fértil',
        achievements: [],
        notificationSettings: { commentsOnMyPost: true, newLives: true, newPodcasts: true },
        playlists: [],
        dailyStreak: 0,
        lastLoginDate: '1970-01-01',
     };
     mockUsers.push(newUser);
     currentMockUser = newUser;
     notifyListeners();
     return Promise.resolve();
};

export const logout = async (): Promise<void> => {
    currentMockUser = null;
    notifyListeners();
    return Promise.resolve();
};

export const onAuthUserChanged = (callback: (user: FirebaseUser | null) => void) => {
    listeners.push(callback);
    
    // Immediately notify the new listener with the current state
    let userToNotify: FirebaseUser | null = null;
    if (currentMockUser) {
        userToNotify = {
            uid: currentMockUser.id,
            email: currentMockUser.email,
            displayName: currentMockUser.displayName,
            photoURL: currentMockUser.avatarUrl,
        } as FirebaseUser;
    }
    callback(userToNotify);

    // Return an unsubscribe function
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};

// These functions can be simple mocks as well, operating on the mockUsers array.
export const createUserProfileDocument = async (firebaseUser: any, displayName: string): Promise<void> => {
    // This is handled by signupWithEmail in the mock setup. No-op.
    return Promise.resolve();
};

export const updateUserProfileDocument = async (userId: string, data: Partial<User>): Promise<void> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if(userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
        // If the updated user is the current user, notify listeners
        if (currentMockUser && currentMockUser.id === userId) {
            currentMockUser = mockUsers[userIndex];
            notifyListeners();
        }
    }
    return Promise.resolve();
};
