// src/firebase.js

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

// Force account picker every time
googleProvider.setCustomParameters({ prompt: 'select_account' });

function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Twitter|Line|Snapchat|WhatsApp|Telegram|MicroMessenger|TikTok/i.test(ua);
}

/**
 * Try popup first — if it fails on mobile, fall back to redirect.
 * Returns ID token (popup) OR null (redirect initiated, page will reload).
 */
export async function signInWithGoogle() {
  // In-app browser: popups and redirects often both fail.
  if (isInAppBrowser()) {
    throw new Error(
      'Google sign-in is blocked inside this app. Please open sahmee.onrender.com in Chrome or Safari.'
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await result.user.getIdToken();
  } catch (err) {
    // Popup blocked or closed → fall back to redirect (works on mobile)
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null; // page reloads
    }
    throw err;
  }
}

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