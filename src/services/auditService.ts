import { get, limitToLast, orderByChild, push, query, ref as dbRef } from 'firebase/database';
import { auth, rtdb } from '../firebase/config';
import type { AuditLog, AuditTargetType } from '../models/AuditLog';
import { currentUser } from './authState';

/**
 * Builds the database entry for an audit log line, to be added to an admin's
 * multi-path update(). The action and its log entry are then saved together or
 * not at all. Only admins can add entries, and nobody can change or delete them.
 */
export function auditUpdate(
  action: string,
  targetType: AuditTargetType,
  targetId: string,
  details: string
): Record<string, unknown> {
  const key = push(dbRef(rtdb, 'auditLogs')).key as string;
  return {
    [`auditLogs/${key}`]: {
      id: key,
      adminId: auth.currentUser?.uid ?? '',
      adminName: (currentUser.value?.displayName ?? 'Administrator').slice(0, 100),
      action: action.slice(0, 100),
      targetType,
      targetId: targetId.slice(0, 200),
      details: details.slice(0, 500),
      createdAt: new Date().toISOString(),
    },
  };
}

/** The latest 200 audit log entries, newest first (admin only). */
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snapshot = await get(
      query(dbRef(rtdb, 'auditLogs'), orderByChild('createdAt'), limitToLast(200))
    );
    const list: AuditLog[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Partial<AuditLog>;
      list.push({
        id: child.key as string,
        adminId: data.adminId ?? '',
        adminName: data.adminName ?? '',
        action: data.action ?? '',
        targetType: data.targetType ?? 'user',
        targetId: data.targetId ?? '',
        details: data.details ?? '',
        createdAt: data.createdAt ?? '',
      });
    });
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Audit log error:', error);
    const code = String((error as { code?: string })?.code ?? '');
    const message = String((error as { message?: string })?.message ?? '');
    if (code.toUpperCase() === 'PERMISSION_DENIED' || message.toUpperCase().includes('PERMISSION_DENIED')) {
      throw new Error('Permission denied. Check that the database rules were published.');
    }
    throw new Error(`Something went wrong (${code || message || 'unknown error'}). Please try again.`);
  }
}