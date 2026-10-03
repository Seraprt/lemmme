import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
    console.error('Google popup error:', err.code, err.message);
    throw err;
  }
}

// Keep this — used by AuthContext on load. Returns null if no redirect happened.
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await result.user.getIdToken();
    }
    return null;
  } catch (err) {
    console.error('Redirect result error:', err.code, err.message);
    return null;
  }
}