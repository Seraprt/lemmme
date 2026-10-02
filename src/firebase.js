import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Starts Google sign-in via full-page redirect.
 * Works even when ad scripts block popups.
 * Returns null — the page navigates away, then back.
 */
export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, googleProvider);
    return null; // page reloads, so we never reach this return
  } catch (err) {
    console.error('Google redirect start error:', err);
    throw err;
  }
}

/**
 * Called on app load to check if we just came back from Google.
 * Returns the Firebase ID token if successful, null otherwise.
 */
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await result.user.getIdToken();
    }
    return null;
  } catch (err) {
    console.error('Google redirect result error:', err);
    return null;
  }
}