import { collection, addDoc, updateDoc, setDoc, getDoc, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Account, LoanAccountReferences } from '../../types';
import { requireDb, getUserCollection } from './helpers';
import { ACCOUNTS } from './constants';

export const getAccounts = async (userId: string, includeHidden = false): Promise<Account[]> => {
  const allAccounts = await getUserCollection<Account>(ACCOUNTS, userId);
  return includeHidden ? allAccounts : allAccounts.filter(account => !account.isHidden);
};

export type AccountInput = Omit<Account, 'id' | 'accounting'> & { accounting?: Account['accounting'] };

interface UserRecordInput {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  [key: string]: unknown;
}

export const addAccount = async (data: AccountInput): Promise<string> => {
  const { number, ...rest } = data;
  const payload = number ? { ...rest, number } : rest;
  const currency = String(payload.currency ?? 'USD').toUpperCase();

  // Create main asset account first
  const assetPayload = { ...payload, currency, accounting: 'asset' as const };
  const assetRef = await addDoc(collection(requireDb(), ACCOUNTS), assetPayload);
  const assetId = assetRef.id;

  // Create child accounts: income, expense, saving — link with parentId
  const childBaseName = payload.name || 'Account';
  const children = [
    { name: `Income - ${childBaseName}`, accounting: 'income' as const, isSaving: false },
    { name: `Expense - ${childBaseName}`, accounting: 'expense' as const, isSaving: false },
    { name: `Saving - ${childBaseName}`, accounting: 'asset' as const, isSaving: true },
  ];

  await Promise.all(
    children.map((child) =>
      addDoc(collection(requireDb(), ACCOUNTS), {
        userId: payload.userId,
        type: payload.type,
        currency,
        name: child.name,
        isSaving: child.isSaving,
        accounting: child.accounting,
        parentId: assetId,
      })
    )
  );

  return assetId;
};

export const addUser = async (data: UserRecordInput): Promise<void> => {
  const { email, displayName, photoURL, ...rest } = data;
  const payload = {
    ...rest,
    ...(email ? { email } : {}),
    ...(displayName ? { displayName } : {}),
    ...(photoURL ? { photoURL } : {}),
  };
  await setDoc(doc(requireDb(), 'users', data.id), payload);
};

export const updateAccount = async (id: string, data: Partial<AccountInput>): Promise<void> => {
  const firestore = requireDb();
  const snapshot = await getDoc(doc(firestore, ACCOUNTS, id));
  const existing = snapshot.exists() ? (snapshot.data() as { parentId?: string }) : null;
  if (existing?.parentId) {
    throw new Error('Child accounts (income/expense/saving) cannot be modified manually.');
  }

  await updateDoc(doc(firestore, ACCOUNTS, id), data);
};

const setAccountDisabledState = async (id: string, disabled: boolean): Promise<void> => {
  const firestore = requireDb();
  const snapshot = await getDoc(doc(firestore, ACCOUNTS, id));
  const existing = snapshot.exists() ? (snapshot.data() as { parentId?: string }) : null;
  if (existing?.parentId) {
    throw new Error('Child accounts (income/expense/saving) cannot be modified manually.');
  }

  const childrenQuery = query(collection(firestore, ACCOUNTS), where('parentId', '==', id));
  const childrenSnap = await getDocs(childrenQuery);
  const batch = writeBatch(firestore);

  batch.update(doc(firestore, ACCOUNTS, id), { disabled });
  childrenSnap.docs.forEach((childDoc) => {
    batch.update(childDoc.ref, { disabled });
  });

  await batch.commit();
};

export const disableAccount = async (id: string): Promise<void> => {
  await setAccountDisabledState(id, true);
};

export const enableAccount = async (id: string): Promise<void> => {
  await setAccountDisabledState(id, false);
};

export const deleteAccount = disableAccount;

export async function getOrCreateLoanAccounts(userId: string, currency = 'USD'): Promise<LoanAccountReferences> {
  const accountsRef = collection(requireDb(), 'accounts');
  const normalizedCurrency = currency.toUpperCase();

  const snap = await getDocs(
    query(
      accountsRef,
      where('userId', '==', userId),
      where('currency', '==', normalizedCurrency)
    )
  );

  const existing: Partial<LoanAccountReferences> = {};
  snap.forEach((d) => {
    const data = d.data();
    if (data.accounting === 'liability' && data.type === 'borrowed') existing.loanPayableId = d.id;
    if (data.accounting === 'asset' && data.type === 'lent') existing.loanReceivableId = d.id;
  });

  if (!existing.loanPayableId) {
    const ref = await addDoc(accountsRef, {
      userId,
      name: `Loan Payable (${normalizedCurrency})`,
      accounting: 'liability',
      type: 'borrowed',
      currency: normalizedCurrency,
      isSaving: false,
      isHidden: true,
    });
    existing.loanPayableId = ref.id;
  }

  if (!existing.loanReceivableId) {
    const ref = await addDoc(accountsRef, {
      userId,
      name: `Loan Receivable (${normalizedCurrency})`,
      accounting: 'asset',
      type: 'lent',
      currency: normalizedCurrency,
      isSaving: false,
      isHidden: true,
    });
    existing.loanReceivableId = ref.id;
  }

  return existing as LoanAccountReferences;
}
