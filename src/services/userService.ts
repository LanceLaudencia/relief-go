import { get, ref as dbRef, update } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import { auditUpdate } from './auditService';

function friendlyError(error: unknown): Error {
  console.error('User service error:', error);
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  const denied =
    code.toUpperCase() === 'PERMISSION_DENIED' ||
    message.toUpperCase().includes('PERMISSION_DENIED');

  if (denied) {
    return new Error('Permission denied. Check that the database rules were published.');
  }
  return new Error(`Something went wrong (${code || message || 'unknown error'}). Please try again.`);
}

/** All accounts, newest first (admin only). */
export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const snapshot = await get(dbRef(rtdb, 'users'));
    const list: AppUser[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Partial<AppUser>;
      list.push({
        uid: child.key as string,
        email: data.email ?? '',
        displayName: data.displayName ?? '',
        role: data.role ?? 'user',
        phone: data.phone ?? '',
        isSuspended: data.isSuspended === true,
        createdAt: data.createdAt ?? '',
      });
    });
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Suspends or reactivates an account, and records it in the audit log. */
export async function setUserSuspended(
  user: AppUser,
  suspended: boolean,
  reason: string
): Promise<void> {
  try {
    const note = reason.trim() ? ` - ${reason.trim()}` : '';
    await update(dbRef(rtdb), {
      [`users/${user.uid}/isSuspended`]: suspended,
      ...auditUpdate(
        suspended ? 'Suspended user' : 'Reactivated user',
        'user',
        user.uid,
        `${user.displayName} (${user.email})${note}`
      ),
    });
  } catch (error) {
    throw friendlyError(error);
  }
}