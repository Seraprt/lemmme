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

// Detect mobile / in-app browsers
function isMobileOrInApp() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile|Windows Phone|Opera Mini|IEMobile/i.test(ua);
  const isInApp =
    /FBAN|FBAV|Instagram|Twitter|Line|Snapchat|WhatsApp|Telegram|MicroMessenger/i.test(ua);
  return isMobile || isInApp;
}

/**
 * Google sign-in that works on both desktop and mobile.
 * - Desktop → popup (better UX)
 * - Mobile / in-app → redirect (popups are blocked)
 */
export async function signInWithGoogle() {
  if (isMobileOrInApp()) {
    // Mobile path: use redirect
    await signInWithRedirect(auth, googleProvider);
    return null; // page reloads, so we never reach here
  }

  // Desktop path: use popup
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
}

/**
 * On app start, check if we just returned from a Google redirect.
 * If so, returns the ID token. Otherwise returns null.
 */
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await result.user.getIdToken();
    }
    return null;
  } catch (err) {
    console.error('Redirect sign-in error:', err);
    return null;
  }
}