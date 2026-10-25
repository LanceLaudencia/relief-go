import { ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { get, ref as dbRef } from 'firebase/database';
import { auth, rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';

/** The logged-in user's profile (from Realtime Database), or null when logged out. */
export const currentUser = ref<AppUser | null>(null);

let registering = false;
let readyPromise: Promise<void> | null = null;

export function setCurrentUser(user: AppUser | null): void {
  currentUser.value = user;
}

/** While registering, authService saves the profile itself. */
export function setRegistering(value: boolean): void {
  registering = value;
}

export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await get(dbRef(rtdb, `users/${uid}`));
  if (!snapshot.exists()) return null;

  const data = snapshot.val() as AppUser;
  // phone is optional, so make sure it is always a string
  return { ...data, phone: data.phone ?? '' };
}

/**
 * Starts listening to Firebase login state.
 * Resolves after the first check, so the router can wait before deciding
 * whether a page is allowed.
 */
export function initAuth(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise<void>((resolve) => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (registering) {
        resolve();
        return;
      }

      if (!firebaseUser) {
        currentUser.value = null;
      } else {
        try {
          const profile = await fetchUserProfile(firebaseUser.uid);
          // Suspended accounts are treated as logged out
          currentUser.value = profile && !profile.isSuspended ? profile : null;
        } catch (error) {
          console.error('Failed to load user profile:', error);
          currentUser.value = null;
        }
      }
      resolve();
    });
  });

  return readyPromise;
}