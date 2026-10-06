import React from 'react';
import { useAuth } from '../context/AuthContext';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import SocialLinks from '../components/SocialLinks';

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