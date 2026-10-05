import React, { useEffect, useRef } from 'react';

const ADSTERRA_KEY = 'c6843cacd18730ff847a2e9e3e254998';
const SCRIPT_HOST = 'https://www.highrevenueformat.com';

export default function BannerAd({ height = 250, width = 300 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous content (React re-render safety)
    containerRef.current.innerHTML = '';

    // Adsterra reads this global before loading invoke.js
    window.atOptions = {
      key: ADSTERRA_KEY,
      format: 'iframe',
      height,
      width,
      params: {},
    };

    // Inject invoke script inside the container
    const script = document.createElement('script');
    script.src = `${SCRIPT_HOST}/${ADSTERRA_KEY}/invoke.js`;
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [height, width]);

  return (
    <div className="banner-ad-wrap">
      <div
        ref={containerRef}
        className="banner-ad-container"
        style={{ minHeight: height, width, maxWidth: '100%' }}
      />
      <span className="banner-ad-label">Advertisement</span>
    </div>
  );
}