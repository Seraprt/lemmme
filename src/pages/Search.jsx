import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import { teamApi } from '../api';
import { BannerAd } from '../components/AdSlot';

export default function Search({ onOpenTeam }) {
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // initial broad load
  useEffect(() => {
    setLoading(true);
    teamApi
      .search('a')
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  // live search
  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => {
      teamApi.search(query).then(setTeams).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const grouped = teams.reduce((acc, t) => {
    const lg = t.league || 'Other';
    (acc[lg] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="screen">
      <div className="searchbar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A6474" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          placeholder="Search a club…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {loading && teams.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
          Loading…
        </div>
      )}

      {!loading && teams.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
          No club found.
        </div>
      )}

      <BannerAd height={80} label="Banner Ad" />

      {Object.entries(grouped).map(([lg, list]) => (
        <div key={lg}>
          <div className="group-label">{lg}</div>
          {list.map((t) => (
            <button
              key={t.id}
              className="team-item"
              onClick={() => onOpenTeam(t.id)}
            >
              <Crest team={t} />
              <span className="name">{t.name}</span>
              <span className="lg-name">{t.short}</span>
            </button>
          ))}
        </div>
      ))}

      <BannerAd height={90} label="Banner Ad" />
    </div>
  );
}