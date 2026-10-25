import type { UserRole } from '../models/User';

/** Where each role lands after logging in. */
export function dashboardPathForRole(role: UserRole): string {
  return role === 'admin' ? '/admin' : '/dashboard';
}