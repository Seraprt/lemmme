import React, { useEffect, useState } from 'react';

const LAST_SHOWN_KEY = 'formline_promo_last_shown';
const SHOW_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 30 * 1000;    // check every 30s

// Configure your promos here
const PROMOS = [
  {
    id: 'gaming',
    title: 'Play Games. Win Real Cash.',
    body: 'Join our gaming platform — trivia, tournaments and runner games with real cash prizes every day.',
    image:
      import.meta.env.VITE_PROMO_GAMING_IMG ||
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=70',
    cta: 'Join Now',
    link: import.meta.env.VITE_PROMO_GAMING_LINK || '#',
  },
];

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [promo, setPromo] = useState(PROMOS[0]);

  useEffect(() => {
    function shouldShow() {
      const last = parseInt(localStorage.getItem(LAST_SHOWN_KEY) || '0', 10);
      return Date.now() - last > SHOW_INTERVAL_MS;
    }

    function trigger() {
      if (!shouldShow()) return;
      // Pick a random promo each time
      const pick = PROMOS[Math.floor(Math.random() * PROMOS.length)];
      setPromo(pick);
      setVisible(true);
      localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    }

    // 1. Try to show on mount (with a small delay so the page renders first)
    const initialTimer = setTimeout(trigger, 1500);

    // 2. Keep checking periodically while the user stays on the site
    const interval = setInterval(trigger, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  function close() {
    setVisible(false);
  }

  function open() {
    window.open(promo.link, '_blank', 'noopener,noreferrer');
    close();
  }

  if (!visible) return null;

  return (
    <div className="promo-overlay" onClick={close}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-close" onClick={close} aria-label="Close">
          ×
        </button>

        <div className="promo-image">
          <img src={promo.image} alt="" />
        </div>

        <div className="promo-body">
          <h3 className="promo-title">{promo.title}</h3>
          <p className="promo-text">{promo.body}</p>

          <div className="promo-actions">
            <button className="promo-cta" onClick={open}>
              {promo.cta} →
            </button>
            <button className="promo-dismiss" onClick={close}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}