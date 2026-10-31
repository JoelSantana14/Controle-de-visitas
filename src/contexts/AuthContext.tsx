import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, getSecondaryAuth } from '../firebase';
import { firestoreService } from '../services/firestoreService';
import { AppUser, UserRole } from '../types';

export const MASTER_ADMIN_EMAIL = 'joelsantanaimoveis@gmail.com';
export const DEFAULT_INITIAL_PASSWORD = 'Immo123!';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  usersList: AppUser[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  adminCreateUser: (userData: {
    email: string;
    displayName: string;
    role: UserRole;
    brokerId?: string;
    brokerName?: string;
    phone?: string;
    creci?: string;
    initialPassword?: string;
  }) => Promise<{ success: boolean; error?: string; initialPassword?: string }>;
  adminToggleUserStatus: (uid: string, active: boolean) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (uid: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to users list in realtime for admin and lookup
  useEffect(() => {
    const unsub = firestoreService.subscribeUsers((users) => {
      setUsersList(users);
      // If currently logged in, sync latest profile state
      if (firebaseUser) {
        const found = users.find(u => u.uid === firebaseUser.uid || u.email.toLowerCase() === (firebaseUser.email || '').toLowerCase());
        if (found) {
          const isMaster = (firebaseUser.email || '').toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
          setCurrentUser({
            ...found,
            role: isMaster ? 'admin' : found.role,
          });
        }
      }
    });
    return () => unsub();
  }, [firebaseUser]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const isMaster = normalizedEmail === MASTER_ADMIN_EMAIL.toLowerCase();

        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data() as AppUser;
            // Check if deactivated
            if (data.active === false && !isMaster) {
              await signOut(auth);
              setCurrentUser(null);
              setLoading(false);
              return;
            }
            setCurrentUser({
              ...data,
              role: isMaster ? 'admin' : data.role,
            });
          } else {
            // First time user profile creation
            const newUser: AppUser = {
              uid: user.uid,
              email: normalizedEmail,
              displayName: user.displayName || (isMaster ? 'Administrador Joel Santana' : normalizedEmail.split('@')[0]),
              role: isMaster ? 'admin' : 'broker',
              active: true,
              createdAt: new Date().toISOString(),
              mustChangePassword: false,
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Fallback minimal user
          setCurrentUser({
            uid: user.uid,
            email: normalizedEmail,
            displayName: user.displayName || normalizedEmail,
            role: isMaster ? 'admin' : 'broker',
            active: true,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();

      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        // Verify active status
        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        if (snap.exists()) {
          const profile = snap.data() as AppUser;
          if (profile.active === false && !isMaster) {
            await signOut(auth);
            return { success: false, error: 'Usuário desativado. Contate o administrador.' };
          }
        }
        return { success: true };
      } catch (authError: any) {
        // If master admin first time setup and account doesn't exist yet, offer creation
        if (isMaster && (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential')) {
          try {
            // Try creating the master admin account with the provided password
            await createUserWithEmailAndPassword(auth, cleanEmail, pass);
            return { success: true };
          } catch (createErr: any) {
            // If already exists but bad password
            if (createErr.code === 'auth/email-already-in-use') {
              return { success: false, error: 'Senha incorreta para a conta de Administrador.' };
            }
            return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
          }
        }

        if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
          return { success: false, error: 'E-mail ou senha incorretos.' };
        } else if (authError.code === 'auth/user-not-found') {
          return { success: false, error: 'Usuário não cadastrado no sistema.' };
        } else if (authError.code === 'auth/too-many-requests') {
          return { success: false, error: 'Muitas tentativas sem sucesso. Aguarde alguns instantes.' };
        }
        return { success: false, error: authError.message || 'Falha na autenticação.' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro inesperado no login.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase() || '';
      const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase();

      // Check user registration
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      if (!snap.exists()) {
        const newUser: AppUser = {
          uid: result.user.uid,
          email,
          displayName: result.user.displayName || email.split('@')[0],
          role: isMaster ? 'admin' : 'broker',
          active: true,
          createdAt: new Date().toISOString(),
          mustChangePassword: false,
        };
        await setDoc(doc(db, 'users', result.user.uid), newUser);
        setCurrentUser(newUser);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao autenticar com Google.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Nenhum usuário conectado.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      // Mark mustChangePassword as false
      if (currentUser?.uid) {
        await firestoreService.saveUser({
          ...currentUser,
          mustChangePassword: false,
        });
      }
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Por segurança, faça logout e login novamente antes de alterar sua senha.' };
      }
      return { success: false, error: err.message || 'Erro ao alterar a senha.' };
    }
  };

  // Admin registers a new user (creates Auth credentials via secondary instance without signing out admin)
  const adminCreateUser = async (userData: {
    email: string;
    displayName: string;
    role: UserRole;
    brokerId?: string;
    brokerName?: string;
    phone?: string;
    creci?: string;
    initialPassword?: string;
  }): Promise<{ success: boolean; error?: string; initialPassword?: string }> => {
    const initialPass = userData.initialPassword || DEFAULT_INITIAL_PASSWORD;
    const cleanEmail = userData.email.trim().toLowerCase();

    try {
      // Use secondary auth instance so current admin session remains unaffected
      const secondaryAuth = getSecondaryAuth();
      const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, initialPass);
      const uid = cred.user.uid;
      
      // Clean secondary session
      await signOut(secondaryAuth);

      // Save user profile in Firestore
      const newUser: AppUser = {
        uid,
        email: cleanEmail,
        displayName: userData.displayName,
        role: userData.role,
        brokerId: userData.brokerId,
        brokerName: userData.brokerName,
        phone: userData.phone,
        creci: userData.creci,
        active: true,
        createdAt: new Date().toISOString(),
        mustChangePassword: true,
      };

      await firestoreService.saveUser(newUser);

      return { success: true, initialPassword: initialPass };
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'A senha padrão deve ter no mínimo 6 caracteres.' };
      }
      return { success: false, error: err.message || 'Falha ao cadastrar usuário.' };
    }
  };

  const adminToggleUserStatus = async (uid: string, active: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const userToUpdate = usersList.find(u => u.uid === uid);
      if (userToUpdate) {
        await firestoreService.saveUser({ ...userToUpdate, active });
        return { success: true };
      }
      return { success: false, error: 'Usuário não encontrado.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const adminDeleteUser = async (uid: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await firestoreService.deleteUser(uid);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const isAdmin = currentUser?.role === 'admin' || (currentUser?.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAdmin,
        loading,
        usersList,
        login,
        loginWithGoogle,
        logout,
        changePassword,
        adminCreateUser,
        adminToggleUserStatus,
        adminDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
