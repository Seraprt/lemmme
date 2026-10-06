import React from 'react';

const SOCIALS = [
  {
    name: 'WhatsApp Channel',
    href: 'https://whatsapp.com/channel/0029VbEDHfD0LKZLFzFg021J', // TODO: paste your WhatsApp channel URL
    color: '#25D366',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.2-.2.3-.7 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 .9-1 2.2s1 2.6 1.2 2.8c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-3-.2-.3c-.8-1.4-1.3-2.9-1.3-4.5 0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.4-8.1 8.4z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@formline70?_r=1&_t=ZN-9AJhx77tDeR', // TODO: paste your TikTok URL
    color: '#FE2C55',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8.5a6.5 6.5 0 0 1-5-2.5v9.5A5 5 0 1 1 10 10.5v3a2 2 0 1 0 2 2V3h3a5.5 5.5 0 0 0 5 5.5v3z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/19am9Rb2SP/', // TODO: paste your Facebook page URL
    color: '#1877F2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/formline54c', // TODO: paste your X.com URL
    color: '#E9EEF6',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.3 8.4L23 22h-6.7l-5.2-6.8L5.1 22H2l7.8-8.9L1.5 2h6.9l4.7 6.2L18.9 2zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20z" />
      </svg>
    ),
  },
];

export default function SocialLinks({ title = 'Follow Formline' }) {
  return (
    <div className="social-block">
      <div className="sec-head">
        <h2>{title}</h2>
        <span>Stay updated</span>
      </div>

      <div className="social-list">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            className="social-item"
            target="_blank"
            rel="noopener noreferrer"
            style={{ '--sc': s.color }}
          >
            <span className="social-icon">{s.icon}</span>
            <span className="social-name">{s.name}</span>
            <span className="social-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}