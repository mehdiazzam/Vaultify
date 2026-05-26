import { db } from '../../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Account } from '../../types';

export const requireDb = (): Firestore => {
  if (!db) {
    throw new Error('Firestore is not configured. Add your Firebase environment variables first.');
  }

  return db;
};

export const mapDoc = <T extends { id: string }>(snapshotDoc: QueryDocumentSnapshot<DocumentData>): T => {
  return { id: snapshotDoc.id, ...snapshotDoc.data() } as T;
};

export const getUserCollection = async <T extends { id: string }>(collectionName: string, userId: string): Promise<T[]> => {
  const firestore = requireDb();
  const userQuery = query(collection(firestore, collectionName), where('userId', '==', userId));
  const snap = await getDocs(userQuery);

  return snap.docs.map((snapshotDoc) => mapDoc<T>(snapshotDoc));
};

export async function getAccountById(accountId: string): Promise<Account | null> {
  const docSnap = await getDoc(doc(requireDb(), 'accounts', accountId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Account;
}

export default null as unknown as void;
