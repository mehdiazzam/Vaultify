import { collection, doc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { DocumentData, DocumentReference, FieldValue, WithFieldValue } from 'firebase/firestore';
import type { Loan, Transaction } from '../../types';
import { requireDb } from './helpers';

export type LoanInput = Omit<Loan, 'id' | 'createdAt'>;
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

/**
 * Create a loan document and an associated opening transaction atomically.
 * Returns the created loan id.
 */
export async function createLoanWithTransaction(
  loanData: LoanInput,
  txData: TransactionInput
): Promise<string> {
  const db = requireDb();
  const loansRef = collection(db, 'loans');
  const txRef = collection(db, 'transactions');

  let loanId = '';

  // Use a transaction for strong guarantees (keeps existing semantics)
  await runTransaction(db, async (firestoreTx) => {
    const loanDocRef = doc(loansRef);
    loanId = loanDocRef.id;

    const txDocRef = doc(txRef);

    const txPayload: TransactionInput & { createdAt: FieldValue } = {
      ...txData,
      relatedLoanId: loanId,
      createdAt: serverTimestamp(),
    };

    const loanPayload: LoanInput & { createdAt: FieldValue } = {
      ...loanData,
      createdAt: serverTimestamp(),
    };

    firestoreTx.set(loanDocRef, loanPayload);
    firestoreTx.set(txDocRef, txPayload);
  });

  return loanId;
}

/**
 * Apply a repayment: create a repayment transaction and update loan fields atomically.
 * `loanId` must be the id of the loan document to update.
 * `loanUpdate` is a plain object of fields to `update` on the loan.
 */
export async function applyRepaymentTransaction(
  loanId: string,
  loanUpdate: Partial<Loan>,
  txData: TransactionInput
): Promise<void> {
  const db = requireDb();
  const loanRef = doc(collection(db, 'loans'), loanId);
  const txRef = collection(db, 'transactions');

  await runTransaction(db, async (firestoreTx) => {
    const txDocRef = doc(txRef);

    const txPayload: TransactionInput & { createdAt: FieldValue } = {
      ...txData,
      relatedLoanId: loanId,
      createdAt: serverTimestamp(),
    };

    firestoreTx.set(txDocRef, txPayload);
    firestoreTx.update(loanRef, {
      ...loanUpdate,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Utility for simple paired writes when no reads are required.
 * Uses a write batch to write multiple docs atomically.
 */
export async function batchWriteDocs<T extends DocumentData>(
  writes: Array<{ ref: DocumentReference<T>; data: WithFieldValue<T> }>
): Promise<void> {
  const db = requireDb();
  const batch = writeBatch(db);

  writes.forEach((w) => batch.set(w.ref, w.data));

  await batch.commit();
}
