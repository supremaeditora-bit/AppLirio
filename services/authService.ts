import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { User } from '../types';

// Função para criar um perfil de usuário no Firestore
export const createUserProfileDocument = async (firebaseUser: FirebaseUser, displayName: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    // Só cria o documento se ele não existir
    if (!userSnap.exists()) {
// FIX: Added missing properties 'points' and 'level' to satisfy the User type.
        const newUser: Omit<User, 'id' | 'completedContentIds'> = {
            email: firebaseUser.email!,
            displayName: displayName || firebaseUser.displayName || 'Usuária Anônima',
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName || 'U')}`,
            role: 'aluna',
            bio: '',
            cidade: '',
            igreja: '',
            socialLinks: {},
            points: 0,
            level: 'Iniciante da Fé',
        };

        // Usamos setDoc para garantir que o documento seja criado com o UID do usuário
        await setDoc(userRef, {
            ...newUser,
            id: firebaseUser.uid, // Armazenar o id também no documento
            completedContentIds: [], // UPDATED: now string[]
            createdAt: serverTimestamp() // Adiciona um timestamp de quando foi criado
        });
    }
};

export const updateUserProfileDocument = async (userId: string, data: Partial<User>): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
};

export const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        // Garante a criação do perfil no primeiro login com Google
        await createUserProfileDocument(userCredential.user, userCredential.user.displayName || 'Nova Usuária');
        // O onAuthStateChanged no App.tsx cuidará do resto
    } catch (error) {
        console.error("Erro no login com Google:", error);
        throw error;
    }
};

export const signupWithEmail = async (displayName: string, email: string, pass: string): Promise<void> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        // Atualiza o perfil no Firebase Auth
        await updateProfile(firebaseUser, { displayName });

        // Cria o documento de perfil no Firestore
        await createUserProfileDocument(firebaseUser, displayName);
        
    } catch (error: any) {
        console.error("Erro no cadastro:", error);
        // Mapeia erros do Firebase para mensagens mais amigáveis
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("User already registered");
        }
        if (error.code === 'auth/weak-password') {
            throw new Error("Password should be at least 6 characters");
        }
        throw error;
    }
};

export const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // O onAuthStateChanged no App.tsx cuidará do resto
    } catch (error: any) {
        console.error("Erro no login:", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error("Invalid login credentials");
        }
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
};

// Passa o listener de autenticação para o App.tsx
export const onAuthUserChanged = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};