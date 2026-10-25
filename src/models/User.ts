/**
 * "user" is the role new accounts get: they can both donate and run campaigns.
 * "donor" and "organizer" are older accounts and are treated the same as "user".
 */
export type UserRole = 'user' | 'donor' | 'organizer' | 'admin';

/** Every role that can donate and create campaigns (everyone except admins). */
export const MEMBER_ROLES: UserRole[] = ['user', 'donor', 'organizer'];

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone: string;
  isSuspended: boolean;
  createdAt: string; // ISO date string
}