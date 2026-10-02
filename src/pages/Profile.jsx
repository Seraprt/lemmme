import React from 'react';
import { useAuth } from '../context/AuthContext';

const SOCIALS = [
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 12s0-3.5-.5-5.2c-.3-1-1.1-1.7-2-2C18.8 4.5 12 4.5 12 4.5s-6.8 0-8.5.3c-.9.3-1.7 1-2 2C1 8.5 1 12 1 12s0 3.5.5 5.2c.3 1 1.1 1.7 2 2 1.7.3 8.5.3 8.5.3s6.8 0 8.5-.3c.9-.3 1.7-1 2-2C23 15.5 23 12 23 12zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8.5a6.5 6.5 0 0 1-5-2.5v9.5A5 5 0 1 1 10 10.5v3a2 2 0 1 0 2 2V3h3a5.5 5.5 0 0 0 5 5.5v3z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.3 8.4L23 22h-6.7l-5.2-6.8L5.1 22H2l7.8-8.9L1.5 2h6.9l4.7 6.2L18.9 2zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20z" />
      </svg>
    ),
  },
];

export default function Profile({ onBack }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="screen" style={{ padding: 60, textAlign: 'center' }}>
        Not signed in.
      </div>
    );
  }

  const initials = (user.username || '?').slice(0, 2).toUpperCase();

  return (
    <div className="screen">
      <div style={{ padding: '0 16px 4px' }}>
        <button
          className="chip"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <h1>{user.username}</h1>
        <p>{user.email}</p>
        <span className="profile-provider">
          {user.provider === 'google' ? '🔗 Signed in with Google' : '🔒 Signed in with email'}
        </span>
      </div>

      <div className="sec-head">
        <h2>Account</h2>
        <span>Details</span>
      </div>

      <div className="profile-detail-list">
        <div className="profile-detail-row">
          <span className="profile-detail-label">Username</span>
          <span className="profile-detail-value">{user.username}</span>
        </div>
        <div className="profile-detail-row">
          <span className="profile-detail-label">Email</span>
          <span className="profile-detail-value">{user.email}</span>
        </div>
        <div className="profile-detail-row">
          <span className="profile-detail-label">Sign-in method</span>
          <span className="profile-detail-value">
            {user.provider === 'google' ? 'Google' : 'Email & password'}
          </span>
        </div>
      </div>

      {/* Social reach */}
      <div className="sec-head">
        <h2>Follow Formline</h2>
        <span>Stay updated</span>
      </div>

      <div className="profile-socials">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            className="profile-social-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="profile-social-icon">{s.icon}</span>
            <span className="profile-social-name">{s.name}</span>
            <span className="profile-social-arrow">→</span>
          </a>
        ))}
      </div>

      <div style={{ padding: '24px 16px 32px' }}>
        <button
          className="btn-primary"
          style={{
            width: '100%',
            margin: 0,
            background: 'rgba(255, 97, 97, 0.15)',
            color: '#FF8A8A',
            border: '1px solid rgba(255, 97, 97, 0.3)',
          }}
          onClick={logout}
        >
          🚪 Sign out
        </button>
      </div>
    </div>
  );
}