import React from 'react';

const LINKS = {
  adsterra:
    'https://www.profitableratecpmnetwork.com/ekzfb9enu?key=bbc9b6432b5a3bb301497bce8537f24e',
  monetag: 'https://omg10.com/4/11960576',
};

// Default image URLs — replace with your own CDN when ready
const DEFAULT_IMAGES = {
  adsterra:
    import.meta.env.VITE_ADSTERRA_IMG ||
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=70',
  monetag:
    import.meta.env.VITE_MONETAG_IMG ||
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=200&q=70',
};

export default function Smartlink({
  text = 'Sponsored Offer',
  type = 'adsterra',
  href,
  image,
}) {
  const url = href || LINKS[type] || LINKS.adsterra;
  const imageUrl = image || DEFAULT_IMAGES[type] || DEFAULT_IMAGES.adsterra;

  return (
    <a
      className="smartlink-inline"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="smartlink-thumb">
        <img src={imageUrl} alt="" loading="lazy" />
      </span>
      <span className="smartlink-body">
        <span className="smartlink-text">{text}</span>
        <span className="smartlink-hint">Tap to view</span>
      </span>
      <span className="smartlink-arrow">→</span>
    </a>
  );
}