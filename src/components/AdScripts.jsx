import { useEffect } from 'react';

const ADSTERRA_SOCIAL_BAR =
  'https://pl31611945.profitableratecpmnetwork.com/8f/61/8f/8f618f7f8282b498a3b6f17f621d2719.js';
const MONETAG_ZONE = '11938025';

export default function AdScripts() {
  useEffect(() => {
    // ── Adsterra Social Bar ──
    if (!document.querySelector(`script[src="${ADSTERRA_SOCIAL_BAR}"]`)) {
      const s = document.createElement('script');
      s.src = ADSTERRA_SOCIAL_BAR;
      s.async = true;
      document.head.appendChild(s);
    }

    // ── Monetag In-Page Push ──
    if (!document.querySelector('script[data-zone="' + MONETAG_ZONE + '"]')) {
      const s = document.createElement('script');
      s.dataset.zone = MONETAG_ZONE;
      s.src = 'https://nap5k.com/tag.min.js';
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      document.body.appendChild(s);
    }
  }, []);

  return null;
}