import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { addUser } from './firestore';

const syncUserDocument = async (userId: string, name: string, email?: string | null, photoURL?: string | null) => {
  await addUser({
    id: userId,
    name,
    email: email ?? undefined,
    displayName: name,
    photoURL: photoURL ?? undefined,
  });
};

const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
};

const syncGoogleCredential = async (cred: UserCredential | null) => {
  if (!cred) return null;

  const displayName = cred.user.displayName || cred.user.email?.split('@')[0] || 'User';
  await syncUserDocument(cred.user.uid, displayName, cred.user.email, cred.user.photoURL);
  return cred;
};

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  if (!auth) throw new Error('Firebase not configured');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await syncUserDocument(cred.user.uid, displayName, cred.user.email ?? email, cred.user.photoURL);
  return cred;
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error('Firebase not configured');
  const cred = await signInWithPopup(auth, createGoogleProvider());
  await syncGoogleCredential(cred);
  return cred;
};

export const logout = async () => {
  if (!auth) return;
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const sendPasswordReset = async (email: string) => {
  if (!auth) throw new Error('Firebase not configured');
  return sendPasswordResetEmail(auth, email);
};

export const updateDisplayName = async (newName: string) => {
  if (!auth?.currentUser) throw new Error('Not authenticated');
  await updateProfile(auth.currentUser, { displayName: newName });
  await syncUserDocument(auth.currentUser.uid, newName, auth.currentUser.email, auth.currentUser.photoURL);
  return auth.currentUser;
};
