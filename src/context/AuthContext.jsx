import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import { signInWithGoogle as firebaseGoogleSignIn } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount, check for stored token ──
  useEffect(() => {
    const token = localStorage.getItem('formline_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('formline_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function persist(token, user) {
    localStorage.setItem('formline_token', token);
    setUser(user);
  }

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