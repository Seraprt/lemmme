import React, { useState } from 'react';

export default function Crest({ team, size = 'md' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cls = size === 'lg' ? 'crest lg' : 'crest';
  const color = team?.color || '#333333';
  const short = (team?.short || team?.name?.slice(0, 3) || '?').toUpperCase();

  return (
    <span className={cls} style={{ '--c': color }}>
      <span className="crest-txt">{short}</span>
      {team?.logo && !imgFailed && (
        <img
          src={team.logo}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      )}
    </span>
  );
}