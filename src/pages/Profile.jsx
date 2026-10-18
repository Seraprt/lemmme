import React from 'react';
import { useAuth } from '../context/AuthContext';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import SocialLinks from '../components/SocialLinks';

export default function Profile({ onBack, onOpenAccuracy }) {
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
          {user.provider === 'google'
            ? 'Signed in with Google'
            : 'Signed in with email'}
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

      {/* ── Performance ── */}
      <div className="sec-head">
        <h2>Performance</h2>
        <span>Stats</span>
      </div>

      <button
        onClick={() => onOpenAccuracy && onOpenAccuracy()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: 'calc(100% - 32px)',
          margin: '0 16px',
          padding: '14px 16px',
          background:
            'linear-gradient(140deg, rgba(200,247,81,0.08), rgba(200,247,81,0.02))',
          border: '1px solid rgba(200,247,81,0.28)',
          borderRadius: 12,
          color: '#E9EEF6',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
          transition: '0.15s',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.985)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(200,247,81,0.14)',
            display: 'grid',
            placeItems: 'center',
            color: '#C8F751',
            flex: '0 0 auto',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: '#E9EEF6',
              letterSpacing: '-0.01em',
            }}
          >
            Prediction Accuracy
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: '#8792A3',
              marginTop: 2,
              lineHeight: 1.35,
            }}
          >
            Win rates by league — best pick, sure bet, secondary, correct score
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C8F751"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: '0 0 auto' }}
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      {/* Adsterra Banner */}
      <BannerAd height={250} width={300} />

      {/* Social links */}
      <SocialLinks title="Follow Formline" />

      <Smartlink text="Special Offer" type="adsterra" />

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
          Sign out
        </button>
      </div>
    </div>
  );
}