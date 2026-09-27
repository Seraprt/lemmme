import React from 'react';

// ─────────────────────────────────────────────
// Adsterra Banner (placeholder for now)
// When you get your Adsterra banner keys, replace
// the inner <div> with your real <iframe> or <script>.
// ─────────────────────────────────────────────
export function BannerAd({ height = 90, label = 'Banner Ad' }) {
  const key = import.meta.env.VITE_ADSTERRA_BANNER_KEY_1;
  return (
    <div className="ad-slot" style={{ minHeight: height }}>
      {key ? (
        // TODO: paste Adsterra iframe/script here using `key`
        <span>{label}</span>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Smartlink (clickable ad — usually a native ad or
// an interstitial link that pays per click)
// ─────────────────────────────────────────────
export function Smartlink({ text = 'Sponsored', href }) {
  const url = href || import.meta.env.VITE_ADSTERRA_SMARTLINK;
  if (!url) return null;

  return (
    <a
      className="ad-slot smartlink"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text} →
    </a>
  );
}