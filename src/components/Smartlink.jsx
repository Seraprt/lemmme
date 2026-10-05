import React from 'react';

// Ad network endpoints
const LINKS = {
  adsterra:
    'https://www.profitableratecpmnetwork.com/ekzfb9enu?key=bbc9b6432b5a3bb301497bce8537f24e',
  monetag: 'https://omg10.com/4/11960576',
};

export default function Smartlink({
  text = 'Sponsored Offer',
  type = 'adsterra',
  href,
}) {
  const url = href || LINKS[type] || LINKS.adsterra;

  return (
    <a
      className="smartlink-inline"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="smartlink-inline-text">{text}</span>
      <span className="smartlink-inline-arrow">→</span>
    </a>
  );
}