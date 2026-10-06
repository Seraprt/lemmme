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
  const [searching, setSearching] = useState(false);
  const [hotTeams, setHotTeams] = useState([]);

  // Load hot teams once
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

  // Initial broad load (default list of teams)
  useEffect(() => {
    setLoading(true);
    teamApi
      .search('a')
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  // Live search as user types
  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      teamApi
        .search(q)
        .then(setTeams)
        .catch(() => setTeams([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const grouped = teams.reduce((acc, t) => {
    const lg = t.league || 'Other';
    (acc[lg] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="screen">
      <div className="searchbar">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5A6474"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
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

      {/* Spinner while searching */}
      {searching && (
        <div className="search-status">
          <div className="spinner-inline" />
          <span>Searching teams…</span>
        </div>
      )}

      {/* Hot teams — only when there's no search query and not searching */}
      {!query && !searching && hotTeams.length > 0 && (
        <>
          <div className="sec-head">
            <h2>Trending</h2>
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

      {/* Initial load spinner */}
      {loading && teams.length === 0 && (
        <div className="search-status">
          <div className="spinner-inline" />
          <span>Loading teams…</span>
        </div>
      )}

      {/* No results */}
      {!loading && !searching && query && teams.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            color: 'var(--dim)',
            fontSize: 13,
          }}
        >
          No club found for "{query}".
        </div>
      )}

      {/* Team list grouped by league */}
      {!searching &&
        Object.entries(grouped).map(([lg, list]) => (
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