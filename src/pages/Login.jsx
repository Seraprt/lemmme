import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(form.email.trim(), form.password);
      } else {
        if (form.username.trim().length < 3) throw new Error('Username must be at least 3 characters');
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters');
        await signupWithEmail(form.username.trim(), form.email.trim(), form.password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-inner">
        <div className="login-logo">
          <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
            <rect x="1" y="1" width="46" height="46" rx="13" fill="#11151C" stroke="#2A323E" strokeWidth="1.5" />
            <path d="M11 33 L20 23.5 L26.5 28 L37 14" stroke="#C8F751" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="37" cy="14" r="4" fill="#C8F751" />
            <circle cx="11" cy="33" r="3" fill="#5AA9FF" />
          </svg>
          <h1>Formline</h1>
          <p>Match analysis, correct scores and team strength — built on our own model.</p>
        </div>

        <button className="btn-google" onClick={handleGoogle} disabled={busy}>
          <svg width="17" height="17" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.5 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.8c-.6 3-2.3 5.6-4.8 7.3l7.6 5.9c4.4-4.1 7.3-10.2 7.3-17.5z"/>
            <path fill="#FBBC05" d="M10.3 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.4 0-11.8-3.7-13.7-9.1l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">or</div>

        <div className="login-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                placeholder="yourname"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="field">
            <label>{mode === 'login' ? 'Email or username' : 'Email'}</label>
            <input
              type="text"
              placeholder={mode === 'login' ? 'you@example.com' : 'you@example.com'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete={mode === 'login' ? 'username' : 'email'}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', margin: '14px 0 0' }}
            disabled={busy}
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="login-note">
          No password reset. Sessions don't expire — <b>you stay signed in</b> until you clear the app data on your device.
        </p>
      </div>
    </div>
  );
}