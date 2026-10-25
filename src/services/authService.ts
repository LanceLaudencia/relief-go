import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref as dbRef, set } from 'firebase/database';
import { auth, rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import { fetchUserProfile, setCurrentUser, setRegistering } from './authState';

export interface RegisterInput {
  displayName: string;
  email: string;
  phone: string;
  password: string;
}

/** Errors with messages that are already safe and friendly to show. */
class AppError extends Error {}

/** Turns Firebase errors into messages a normal person can understand. */
function friendlyAuthError(error: unknown): string {
  console.error('Firebase error:', error);
  const code = (error as { code?: string })?.code ?? '';
  const message = (error as { message?: string })?.message ?? '';

  if (code === 'PERMISSION_DENIED' || message.includes('PERMISSION_DENIED')) {
    return 'Permission denied. Check that the Realtime Database rules were published.';
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Email/Password sign-in is not enabled in Firebase yet (Authentication → Sign-in method).';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'The Firebase API key is invalid. Check your .env file and restart the app.';
    default:
      return `Something went wrong (${code || 'unknown error'}). Please try again.`;
  }
}

export async function registerUser(input: RegisterInput): Promise<AppUser> {
  let createdUser: User | null = null;
  setRegistering(true);

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password
    );
    createdUser = credential.user;

    await updateProfile(createdUser, { displayName: input.displayName.trim() });

    const profile: AppUser = {
      uid: createdUser.uid,
      email: createdUser.email ?? input.email.trim(),
      displayName: input.displayName.trim(),
      role: 'user', // everyone starts as a regular account; admins are set by hand
      phone: input.phone.trim(),
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    await set(dbRef(rtdb, `users/${createdUser.uid}`), profile);
    setCurrentUser(profile);
    return profile;
  } catch (error) {
    // If the account was created but the profile could not be saved,
    // remove the half-created account so the person can try again.
    if (createdUser) {
      await deleteUser(createdUser).catch(() => undefined);
    }
    throw new AppError(friendlyAuthError(error));
  } finally {
    setRegistering(false);
  }
}

export async function loginUser(email: string, password: string): Promise<AppUser> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await fetchUserProfile(credential.user.uid);

    if (!profile) {
      await signOut(auth);
      throw new AppError(
        'Your account profile could not be found. Please contact the administrator.'
      );
    }

    if (profile.isSuspended) {
      await signOut(auth);
      throw new AppError('This account has been suspended. Please contact the administrator.');
    }

    setCurrentUser(profile);
    return profile;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(friendlyAuthError(error));
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
  setCurrentUser(null);
}

export async function sendResetEmail(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new AppError(friendlyAuthError(error));
  }
}