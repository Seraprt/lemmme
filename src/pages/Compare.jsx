import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import TeamPickerSheet from '../components/TeamPickerSheet';
import { predictionApi } from '../api';
import { BannerAd, Smartlink } from '../components/AdSlot';

const pct = (v) => Math.round((v || 0) * 100);

function barRow(label, v1, v2) {
  // v1/v2 are already normalized 0-1
  const p1 = Math.min(100, pct(v1));
  const p2 = Math.min(100, pct(v2));
  return (
    <div className="bar-row" key={label}>
      <span className="bar-num">{p1}</span>
      <div className="bar-track left">
        <i style={{ width: `${p1}%` }} />
      </div>
      <span className="bar-name">{label}</span>
      <div className="bar-track">
        <i style={{ width: `${p2}%` }} />
      </div>
      <span className="bar-num right">{p2}</span>
    </div>
  );
}

export default function Compare({ prefill, clearPrefill }) {
  const [home, setHome] = useState(null);
  const [away, setAway] = useState(null);
  const [sheetFor, setSheetFor] = useState(null); // 'home' | 'away' | null
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle prefill from Team Detail page
  useEffect(() => {
    if (prefill) {
      setHome(prefill);
      setAway(null);
      setResult(null);
      setSheetFor('away'); // auto-open picker for the other side
      clearPrefill?.();
    }
  }, [prefill, clearPrefill]);

  async function runCompare() {
    if (!home || !away) return;
    setLoading(true);
    setError('');
    try {
      const res = await predictionApi.compare(home.id, away.id);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Compare failed');
      setResult(null);
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
          <span className="slot-tag">Home</span>
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
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" />
          </svg>
        </button>

        <button
          className={`slot ${away ? 'filled' : ''}`}
          onClick={() => setSheetFor('away')}
        >
          <span className="slot-tag">Away</span>
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

      {result && (
        <>
          <div className="verdict">
            <p className="verdict-eyebrow">Model verdict</p>
            <p className="verdict-winner">{result.pick || result.winner}</p>
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

          {result.markets?.length > 0 && (
            <>
              <div className="sec-head">
                <h2>Markets</h2>
                <span>model generated</span>
              </div>
              <div
                className="list"
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}
              >
                {result.markets.map((m, i) => (
                  <span
                    className="mkt"
                    key={i}
                    style={{ fontSize: 12, padding: '6px 11px' }}
                  >
                    {m.key} <b>{m.value}</b>
                  </span>
                ))}
                <span className="mkt" style={{ fontSize: 12, padding: '6px 11px' }}>
                  Score <b>{result.predicted_correct_score}</b>
                </span>
              </div>
            </>
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
              result.home_team.attack_rating / 2.5,
              result.away_team.attack_rating / 2.5
            )}
            {barRow(
              'Defence',
              result.home_team.defence_rating / 2.5,
              result.away_team.defence_rating / 2.5
            )}
            {barRow(
              'Home',
              result.home_team.home_ppg / 3,
              result.away_team.home_ppg / 3
            )}
            {barRow(
              'Away',
              result.home_team.away_ppg / 3,
              result.away_team.away_ppg / 3
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
                    <div
                      className="reason"
                      data-tone={r.tone}
                      style={{ borderLeftWidth: 2 }}
                    >
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

          <Smartlink text="Sponsored offer" />
          <BannerAd height={90} label="Banner Ad" />
          <div style={{ height: 20 }} />
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