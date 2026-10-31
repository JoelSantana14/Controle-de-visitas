import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

// Support both firebase-applet-config.json and Vercel/Vite environment variables
const resolvedConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || appletConfig.projectId || 'immoflow-crm',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || appletConfig.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || appletConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || appletConfig.authDomain || 'immoflow-crm.firebaseapp.com',
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || (appletConfig as any).firestoreDatabaseId || '(default)',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || appletConfig.storageBucket || 'immoflow-crm.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || appletConfig.messagingSenderId || '1091149038305',
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();
const rawDbId = resolvedConfig.firestoreDatabaseId;
export const db = (rawDbId && rawDbId !== '(default)' && !rawDbId.startsWith('ai-studio-'))
  ? getFirestore(app, rawDbId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Secondary auth instance specifically for admin to register new users without signing out current admin
export const getSecondaryAuth = () => {
  const secondaryApp = getApps().find(a => a.name === 'SecondaryAdminAuth') || initializeApp(resolvedConfig, 'SecondaryAdminAuth');
  return getAuth(secondaryApp);
};

// Safe connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'leads', 'connection-test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is offline or configuration requires attention.");
    }
  }
}
testConnection();

