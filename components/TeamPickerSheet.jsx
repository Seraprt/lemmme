import React, { useEffect, useMemo, useState } from 'react';
import Crest from './Crest';
import { teamApi } from '../api';

export default function TeamPickerSheet({ open, side, onClose, onPick }) {
  const [query, setQuery] = useState('');
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all teams once when opened
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setLoading(true);
    // Search with a common letter to get a broad list
    teamApi
      .search('a')
      .then((teams) => setAllTeams(teams))
      .catch(() => setAllTeams([]))
      .finally(() => setLoading(false));
  }, [open]);

  // Live search as user types
  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) return;
    const t = setTimeout(() => {
      teamApi
        .search(query)
        .then((teams) => setAllTeams(teams))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [query, open]);

  const grouped = useMemo(() => {
    const byLeague = {};
    const q = query.trim().toLowerCase();
    allTeams
      .filter((t) =>
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.short?.toLowerCase().includes(q)
      )
      .forEach((t) => {
        const lg = t.league || 'Other';
        (byLeague[lg] ||= []).push(t);
      });
    return byLeague;
  }, [allTeams, query]);

  if (!open) return null;

  return (
    <div className="sheet">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-head">
          <h3>Choose {side} team</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="searchbar" style={{ margin: '0 16px 10px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A6474" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            autoFocus
            placeholder="Search club…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="sheet-list">
          {loading && Object.keys(grouped).length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
              Loading teams…
            </div>
          )}

          {!loading && Object.keys(grouped).length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
              No club found.
            </div>
          )}

          {Object.entries(grouped).map(([league, teams]) => (
            <div key={league}>
              <div className="group-label">{league}</div>
              {teams.map((t) => (
                <button
                  key={t.id}
                  className="team-item"
                  onClick={() => onPick(t)}
                >
                  <Crest team={t} />
                  <span className="name">{t.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}