import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import TeamPickerSheet from '../components/TeamPickerSheet';
import { predictionApi, teamApi } from '../api';

const pct = (v) => Math.round((v || 0) * 100);

// Invert defence rating for display — lower rating = better defence
function defenceBar(rating) {
  return Math.max(0, Math.min(100, Math.round(((2.5 - (rating || 1)) / 2.2) * 100)));
}

function attackBar(rating) {
  return Math.min(100, Math.round(((rating || 1) / 2.5) * 100));
}

function barRow(label, v1, v2, hint) {
  const p1 = Math.min(100, pct(v1));
  const p2 = Math.min(100, pct(v2));
  return (
    <div className="bar-row" key={label}>
      <span className="bar-num">{p1}</span>
      <div className="bar-track left">
        <i style={{ width: `${p1}%` }} />
      </div>
      <span className="bar-name">
        {label}
        {hint && <span className="bar-hint">{hint}</span>}
      </span>
      <div className="bar-track">
        <i style={{ width: `${p2}%` }} />
      </div>
      <span className="bar-num right">{p2}</span>
    </div>
  );
}

const SUGGESTED_MATCHUPS = [
  { home: 'Manchester City', away: 'Barcelona' },
  { home: 'Chelsea', away: 'Manchester United' },
  { home: 'Real Madrid', away: 'Barcelona' },
  { home: 'Real Madrid', away: 'Atletico Madrid' },
  { home: 'Wolverhampton', away: 'Sporting Braga' },
  { home: 'Fulham', away: 'Real Betis' },
];

async function findTeamByName(name) {
  try {
    const teams = await teamApi.search(name);
    if (!teams?.length) return null;
    // Best match: prefers exact-ish name
    const lower = name.toLowerCase();
    const exact = teams.find((t) => t.name.toLowerCase() === lower);
    return exact || teams[0];
  } catch {
    return null;
  }
}

export default function Compare({ prefill, clearPrefill }) {
  const [home, setHome] = useState(null);
  const [away, setAway] = useState(null);
  const [sheetFor, setSheetFor] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [neutral, setNeutral] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(null);

  useEffect(() => {
    if (prefill) {
      setHome(prefill);
      setAway(null);
      setResult(null);
      setSheetFor('away');
      clearPrefill?.();
    }
  }, [prefill, clearPrefill]);

  async function runCompare() {
    if (!home || !away) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await predictionApi.compare(home.id, away.id, neutral);

      if (res?.error) throw new Error(res.error);
      if (!res?.home_team || !res?.away_team) {
        throw new Error('Malformed response from server');
      }

      setResult(res);
    } catch (err) {
      setError(err.message || 'Compare failed');
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    setHome(away);
    setAway(home);
    setResult(null);
  }

  function pickTeam(t) {
    if (sheetFor === 'home') setHome(t);
    else if (sheetFor === 'away') setAway(t);
    setSheetFor(null);
    setResult(null);
  }

  async function trySuggestion(pair) {
    const key = `${pair.home}-${pair.away}`;
    setLoadingSuggestion(key);
    try {
      const [h, a] = await Promise.all([
        findTeamByName(pair.home),
        findTeamByName(pair.away),
      ]);
      if (h && a) {
        setHome(h);
        setAway(a);
        setResult(null);
        setError('');
      } else {
        setError(`Couldn't find ${pair.home} or ${pair.away} in the database`);
      }
    } finally {
      setLoadingSuggestion(null);
    }
  }

  return (
    <div className="screen">
      <div className="sec-head">
        <h2>Team comparison</h2>
        <span>Head to head</span>
      </div>

      <div className="picker">
        <button
          className={`slot ${home ? 'filled' : ''}`}
          onClick={() => setSheetFor('home')}
        >
          <span className="slot-tag">{neutral ? 'Team A' : 'Home'}</span>
          {home ? (
            <>
              <Crest team={home} />
              <span className="slot-name">{home.name}</span>
            </>
          ) : (
            <span className="slot-empty">Select team</span>
          )}
        </button>

        <button className="swap" onClick={swap} title="Swap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" />
          </svg>
        </button>

        <button
          className={`slot ${away ? 'filled' : ''}`}
          onClick={() => setSheetFor('away')}
        >
          <span className="slot-tag">{neutral ? 'Team B' : 'Away'}</span>
          {away ? (
            <>
              <Crest team={away} />
              <span className="slot-name">{away.name}</span>
            </>
          ) : (
            <span className="slot-empty">Select team</span>
          )}
        </button>
      </div>

      <label className="neutral-toggle">
        <input
          type="checkbox"
          checked={neutral}
          onChange={(e) => {
            setNeutral(e.target.checked);
            setResult(null);
          }}
        />
        <span>Neutral venue (ignore home advantage)</span>
      </label>

      <button
        className="btn-primary"
        disabled={!home || !away || loading}
        onClick={runCompare}
      >
        {loading ? 'Analysing…' : 'Compare teams'}
      </button>

      {error && (
        <div className="error-box" style={{ margin: '14px 16px 0' }}>
          {error}
        </div>
      )}

      {/* Suggested matchups — only when no result shown */}
      {!result && (
        <>
          <div className="sec-head">
            <h2>Try these matchups</h2>
            <span>Quick compare</span>
          </div>
          <div className="suggested-list">
            {SUGGESTED_MATCHUPS.map((pair) => {
              const key = `${pair.home}-${pair.away}`;
              const isLoading = loadingSuggestion === key;
              return (
                <button
                  key={key}
                  className="suggested-item"
                  onClick={() => trySuggestion(pair)}
                  disabled={isLoading}
                >
                  <span className="suggested-team">{pair.home}</span>
                  <span className="suggested-vs">vs</span>
                  <span className="suggested-team">{pair.away}</span>
                  {isLoading && <span className="suggested-loading">…</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {result && result.home_team && result.away_team && (
        <>
          <div className="verdict">
            <p className="verdict-eyebrow">
              {result.neutral ? 'Model verdict · Neutral venue' : 'Model verdict'}
            </p>
            <p className="verdict-winner">
              {result.pick || result.winner || '—'}
            </p>
            <p className="verdict-score">
              {String(result.predicted_correct_score || '0-0')
                .split('-')
                .map((s, i, arr) => (
                  <React.Fragment key={i}>
                    {s}
                    {i < arr.length - 1 && <i>–</i>}
                  </React.Fragment>
                ))}
            </p>
            <p className="verdict-meta">
              {result.home_team.short} {pct(result.home_win_prob)}% · Draw{' '}
              {pct(result.draw_prob)}% · {result.away_team.short}{' '}
              {pct(result.away_win_prob)}%
            </p>
            <div className="verdict-bar">
              <i style={{ width: `${pct(result.confidence)}%` }} />
            </div>
            <p className="verdict-meta" style={{ marginTop: 8 }}>
              Confidence {pct(result.confidence)}%
            </p>
          </div>

          {result.secondary_pick && (
            <div className="secondary-pick" style={{ margin: '12px 16px 0' }}>
              <span className="secondary-label">Also consider:</span>
              <span className="secondary-value">
                {result.secondary_pick.label} (
                {(result.secondary_pick.probability * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          <div className="sec-head">
            <h2>Head to head</h2>
            <span>
              {result.home_team.short} vs {result.away_team.short}
            </span>
          </div>
          <div className="card" style={{ margin: '0 16px', padding: '6px 16px' }}>
            {barRow(
              'Attack',
              attackBar(result.home_team.attack_rating),
              attackBar(result.away_team.attack_rating),
              'higher = better'
            )}
            {barRow(
              'Defence',
              defenceBar(result.home_team.defence_rating),
              defenceBar(result.away_team.defence_rating),
              'higher = better'
            )}
            {!result.neutral && (
              <>
                {barRow(
                  'Home',
                  (result.home_team.home_ppg ?? 1.5) / 3,
                  (result.away_team.home_ppg ?? 1.5) / 3
                )}
                {barRow(
                  'Away',
                  (result.home_team.away_ppg ?? 1) / 3,
                  (result.away_team.away_ppg ?? 1) / 3
                )}
              </>
            )}
          </div>

          {result.reasons?.length > 0 && (
            <>
              <div className="sec-head">
                <h2>Why</h2>
                <span>{result.reasons.length} factors</span>
              </div>
              <div className="list">
                {result.reasons.map((r, i) => (
                  <div className="card" key={i} style={{ padding: '13px 14px' }}>
                    <div className="reason" data-tone={r.tone} style={{ borderLeftWidth: 2 }}>
                      <span className="reason-w">
                        {Math.round((r.weight || 0) * 100)}
                      </span>
                      <span className="reason-tag">{r.tag}</span>
                      <p className="reason-title">{r.title}</p>
                      <p className="reason-text">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ padding: '0 16px 30px' }}>
            <button
              className="filter-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setResult(null);
                setHome(null);
                setAway(null);
              }}
            >
              Compare another pair
            </button>
          </div>
        </>
      )}

      <TeamPickerSheet
        open={!!sheetFor}
        side={sheetFor || ''}
        onClose={() => setSheetFor(null)}
        onPick={pickTeam}
      />
    </div>
  );
}