import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import { teamApi } from '../api';

const HOT_TEAMS = [
  'Real Madrid',
  'Barcelona',
  'Manchester United',
  'Chelsea',
  'Arsenal',
];

export default function Search({ onOpenTeam }) {
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hotTeams, setHotTeams] = useState([]);

  // Load hot teams on mount
  useEffect(() => {
    (async () => {
      const results = [];
      for (const name of HOT_TEAMS) {
        try {
          const list = await teamApi.search(name);
          if (list?.length) results.push(list[0]);
        } catch {
          // ignore
        }
      }
      setHotTeams(results);
    })();
  }, []);

  // Initial broad load
  useEffect(() => {
    setLoading(true);
    teamApi
      .search('a')
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  // Live search
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

      {/* Hot searched — only when no search query */}
      {!query && hotTeams.length > 0 && (
        <>
          <div className="sec-head">
            <h2>🔥 Trending</h2>
            <span>Most viewed</span>
          </div>
          <div className="hot-teams-grid">
            {hotTeams.map((t) => (
              <button
                key={t.id}
                className="hot-team-card"
                onClick={() => onOpenTeam(t.id)}
              >
                <Crest team={t} />
                <span className="hot-team-name">{t.name}</span>
                <span className="hot-team-league">{t.league || '—'}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {loading && teams.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
          Loading…
        </div>
      )}

      {!loading && query && teams.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
          No club found.
        </div>
      )}

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
    </div>
  );
}