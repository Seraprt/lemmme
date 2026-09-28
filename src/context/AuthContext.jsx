import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  getGoogleRedirectResult,
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function persist(token, u) {
    localStorage.setItem('formline_token', token);
    setUser(u);
  }

  // On mount: 1) check redirect result  2) check stored token
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      // 1. If we just came back from a Google redirect, exchange it
      try {
        const idToken = await getGoogleRedirectResult();
        if (idToken) {
          const res = await authApi.googleLogin(idToken);
          if (!cancelled) persist(res.token, res.user);
          return;
        }
      } catch (err) {
        console.error('Google redirect exchange failed:', err);
      }

      // 2. Otherwise check for stored token
      const token = localStorage.getItem('formline_token');
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await authApi.me();
        if (!cancelled) setUser(res.user);
      } catch {
        localStorage.removeItem('formline_token');
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  async function loginWithEmail(identifier, password) {
    const res = await authApi.login({ identifier, password });
    persist(res.token, res.user);
    return res;
  }

  async function signupWithEmail(username, email, password) {
    const res = await authApi.signup({ username, email, password });
    persist(res.token, res.user);
    return res;
  }

  async function loginWithGoogle() {
    const idToken = await firebaseGoogleSignIn();
    // If we got here on mobile, page is reloading — nothing else to do
    if (!idToken) return null;
    const res = await authApi.googleLogin(idToken);
    persist(res.token, res.user);
    return res;
  }

  function logout() {
    localStorage.removeItem('formline_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}