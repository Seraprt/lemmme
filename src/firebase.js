import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (err) {
    console.warn('Popup failed:', err.code);
    // Fallback for popup-blocked
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/internal-error'
    ) {
      console.log('Falling back to redirect...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) return await result.user.getIdToken();
    return null;
  } catch (err) {
    console.error('Redirect result error:', err);
    return null;
  }
}