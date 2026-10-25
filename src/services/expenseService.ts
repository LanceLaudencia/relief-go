import {
  equalTo,
  get,
  orderByChild,
  push,
  query,
  ref as dbRef,
  set,
  update,
} from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import type { Campaign } from '../models/Campaign';
import { auditUpdate } from './auditService';
import type {
  Expense,
  ExpenseCategory,
  ExpenseDocument,
  PublicExpense,
} from '../models/Expense';

/** What the organizer fills in on the expense form. */
export interface ExpenseFormData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string; // YYYY-MM-DD
  documents: ExpenseDocument[];
}

/** Errors whose message is already clear enough to show to the person. */
class ReviewError extends Error {}

function friendlyError(error: unknown): Error {
  console.error('Expense service error:', error);
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  const denied =
    code.toUpperCase() === 'PERMISSION_DENIED' ||
    message.toUpperCase().includes('PERMISSION_DENIED');

  if (denied) {
    return new Error(
      'Permission denied. You may not be allowed to do this, or the database rules have not been published.'
    );
  }
  return new Error('Something went wrong. Please try again.');
}

/** Realtime Database stores lists as objects, so turn them back into a clean list. */
function normalizeDocuments(raw: unknown): ExpenseDocument[] {
  if (!raw || typeof raw !== 'object') return [];
  return Object.values(raw as Record<string, Partial<ExpenseDocument>>)
    .map((doc) => ({
      type: doc.type ?? 'Other',
      url: doc.url ?? '',
      label: doc.label ?? '',
    }))
    .filter((doc) => doc.url !== '');
}

function documentsForDatabase(documents: ExpenseDocument[]): ExpenseDocument[] {
  return documents.map((doc) => ({
    type: doc.type,
    url: doc.url.trim(),
    label: doc.label.trim(),
  }));
}

type RawExpense = Partial<Omit<Expense, 'documents'>> & { documents?: unknown };

function normalizeExpense(id: string, data: RawExpense): Expense {
  return {
    id,
    campaignId: data.campaignId ?? '',
    campaignTitle: data.campaignTitle ?? '',
    organizerId: data.organizerId ?? '',
    organizerName: data.organizerName ?? '',
    description: data.description ?? '',
    amount: data.amount ?? 0,
    category: data.category ?? 'Other',
    expenseDate: data.expenseDate ?? '',
    documents: normalizeDocuments(data.documents),
    status: data.status ?? 'Pending Review',
    createdAt: data.createdAt ?? '',
    reviewedBy: data.reviewedBy ?? '',
    reviewDate: data.reviewDate ?? '',
    rejectionReason: data.rejectionReason ?? '',
  };
}

function snapshotToExpenses(snapshot: DataSnapshot): Expense[] {
  const list: Expense[] = [];
  snapshot.forEach((child) => {
    list.push(normalizeExpense(child.key as string, child.val() as RawExpense));
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

function cleanForm(form: ExpenseFormData) {
  return {
    description: form.description.trim(),
    amount: Math.round(form.amount * 100) / 100,
    category: form.category,
    expenseDate: form.expenseDate,
    documents: documentsForDatabase(form.documents),
  };
}

/* ---------- Organizer ---------- */

/** Submits an expense. It always starts as "Pending Review". */
export async function createExpense(
  campaign: Campaign,
  organizer: AppUser,
  form: ExpenseFormData
): Promise<string> {
  try {
    const newRef = push(dbRef(rtdb, 'expenses'));
    const id = newRef.key as string;

    await set(newRef, {
      id,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      organizerId: organizer.uid,
      organizerName: organizer.displayName,
      ...cleanForm(form),
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Saves edits and sends the expense back to "Pending Review". */
export async function updateExpense(existing: Expense, form: ExpenseFormData): Promise<void> {
  try {
    await set(dbRef(rtdb, `expenses/${existing.id}`), {
      id: existing.id,
      campaignId: existing.campaignId,
      campaignTitle: existing.campaignTitle,
      organizerId: existing.organizerId,
      organizerName: existing.organizerName,
      ...cleanForm(form),
      status: 'Pending Review',
      createdAt: existing.createdAt,
    });
  } catch (error) {
    throw friendlyError(error);
  }
}

/** All expenses of one campaign that belong to this organizer (any status). */
export async function getMyExpensesForCampaign(
  organizerId: string,
  campaignId: string
): Promise<Expense[]> {
  try {
    const snapshot = await get(
      query(dbRef(rtdb, 'expenses'), orderByChild('organizerId'), equalTo(organizerId))
    );
    return snapshotToExpenses(snapshot).filter((expense) => expense.campaignId === campaignId);
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Reads one expense (the organizer who owns it, or an admin). */
export async function getExpense(id: string): Promise<Expense | null> {
  try {
    const snapshot = await get(dbRef(rtdb, `expenses/${id}`));
    if (!snapshot.exists()) return null;
    return normalizeExpense(id, snapshot.val() as RawExpense);
  } catch (error) {
    throw friendlyError(error);
  }
}



/* ---------- Public ---------- */

/** Verified expenses of a campaign, newest first. Safe for anyone to read. */
export async function getPublicExpenses(campaignId: string): Promise<PublicExpense[]> {
  try {
    const snapshot = await get(dbRef(rtdb, `publicExpenses/${campaignId}`));
    const list: PublicExpense[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Partial<Omit<PublicExpense, 'documents'>> & {
        documents?: unknown;
      };
      list.push({
        id: child.key as string,
        description: data.description ?? '',
        amount: data.amount ?? 0,
        category: data.category ?? 'Other',
        expenseDate: data.expenseDate ?? '',
        documents: normalizeDocuments(data.documents),
        verifiedAt: data.verifiedAt ?? '',
      });
    });
    return list.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
  } catch (error) {
    throw friendlyError(error);
  }
}

/* ---------- Administrator ---------- */

export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const snapshot = await get(dbRef(rtdb, 'expenses'));
    return snapshotToExpenses(snapshot);
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Verifies an expense, publishes a public copy of it, and notifies the organizer. */
export async function verifyExpense(expense: Expense, adminUid: string): Promise<void> {
  try {
    const current = await getExpense(expense.id);
    if (!current || current.status !== 'Pending Review') {
      throw new ReviewError('This expense has already been reviewed.');
    }

    const now = new Date().toISOString();
    await update(dbRef(rtdb), {
      [`expenses/${current.id}/status`]: 'Verified',
      [`expenses/${current.id}/reviewedBy`]: adminUid,
      [`expenses/${current.id}/reviewDate`]: now,
      [`expenses/${current.id}/rejectionReason`]: null,
      // Only these fields become public
      [`publicExpenses/${current.campaignId}/${current.id}`]: {
        description: current.description,
        amount: current.amount,
        category: current.category,
        expenseDate: current.expenseDate,
        documents: documentsForDatabase(current.documents),
        verifiedAt: now,
      },
      ...notificationUpdate(current.organizerId, {
        type: 'expense',
        title: 'Expense verified',
        message: `Your ${formatPeso(current.amount)} expense for "${current.campaignTitle}" was verified and is now on the public report.`,
        link: `/organizer/campaigns/${current.campaignId}/expenses`,
      }),
      ...auditUpdate(
        'Verified expense',
        'expense',
        current.id,
        `${formatPeso(current.amount)} (${current.category}) for "${current.campaignTitle}"`
      ),
    });
  } catch (error) {
    if (error instanceof ReviewError) throw error;
    throw friendlyError(error);
  }
}

/** Rejects a pending expense, or revokes a verified one (its public copy is removed). */
export async function rejectExpense(
  expense: Expense,
  adminUid: string,
  reason: string
): Promise<void> {
  try {
    const current = await getExpense(expense.id);
    if (!current || current.status === 'Rejected') {
      throw new ReviewError('This expense has already been rejected.');
    }

    const wasVerified = current.status === 'Verified';
    await update(dbRef(rtdb), {
      [`expenses/${current.id}/status`]: 'Rejected',
      [`expenses/${current.id}/rejectionReason`]: reason.trim(),
      [`expenses/${current.id}/reviewedBy`]: adminUid,
      [`expenses/${current.id}/reviewDate`]: new Date().toISOString(),
      [`publicExpenses/${current.campaignId}/${current.id}`]: null,
      ...notificationUpdate(current.organizerId, {
        type: 'expense',
        title: wasVerified ? 'Expense revoked' : 'Expense rejected',
        message: `Your ${formatPeso(current.amount)} expense for "${current.campaignTitle}" was ${wasVerified ? 'revoked and removed from the public report' : 'rejected'}. Reason: ${reason.trim()}`,
        link: `/organizer/campaigns/${current.campaignId}/expenses`,
      }),
      ...auditUpdate(
        wasVerified ? 'Revoked expense' : 'Rejected expense',
        'expense',
        current.id,
        `${formatPeso(current.amount)} (${current.category}) for "${current.campaignTitle}" - ${reason.trim()}`
      ),
    });
  } catch (error) {
    if (error instanceof ReviewError) throw error;
    throw friendlyError(error);
  }
}