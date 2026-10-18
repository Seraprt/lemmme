import React, { useEffect, useState } from 'react';
import { accuracyApi } from '../api';

const LA_STYLES = `
  .la-wrap { padding-bottom: 24px; }

  .la-grid-4 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  @media (min-width: 520px) {
    .la-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .la-tile {
    padding: 12px;
    background: #11151C;
    border: 1px solid #232B37;
    border-radius: 10px;
    min-width: 0;
  }
  .la-tile-label {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #5A6474;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .la-tile-rate {
    font-size: clamp(18px, 5.4vw, 22px);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    margin-bottom: 4px;
  }
  .la-tile-sub {
    font-size: 10.5px;
    color: #5A6474;
    font-variant-numeric: tabular-nums;
  }

  .la-league-card {
    padding: 14px;
    background: #11151C;
    border: 1px solid #232B37;
    border-radius: 12px;
    margin-top: 10px;
  }
  .la-league-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
    min-width: 0;
  }
  .la-league-name {
    font-size: clamp(13px, 3.8vw, 14.5px);
    font-weight: 800;
    color: #E9EEF6;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .la-league-count {
    font-size: 10.5px;
    color: #5A6474;
    font-weight: 700;
    flex: 0 0 auto;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .la-row {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr) 76px;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
  }
  .la-row-label {
    font-size: 11px;
    color: #8792A3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .la-row-bar {
    height: 6px;
    background: #1C222C;
    border-radius: 3px;
    overflow: hidden;
    min-width: 0;
  }
  .la-row-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }
  .la-row-right {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }
  .la-row-right small {
    color: #5A6474;
    font-weight: 600;
    font-size: 9.5px;
    margin-left: 3px;
  }

  .la-sort-row {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-bottom: 6px;
    scrollbar-width: none;
  }
  .la-sort-row::-webkit-scrollbar { display: none; }
  .la-sort-btn {
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    flex: 0 0 auto;
    font-family: inherit;
    transition: 0.15s;
  }
  .la-sort-btn:active { transform: scale(0.97); }

  .la-back-btn {
    background: transparent;
    border: 0;
    color: #C8F751;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    margin-bottom: 14px;
  }
  .la-back-btn:active { opacity: 0.7; }
`;

const COLOR_MAP = {
  bestPick: '#C8F751',
  sureBet: '#3ED598',
  secondary: '#5AA9FF',
  correctScore: '#FFB020',
};

function RatePill({ rate, hits, total, color }) {
  const display = rate == null ? '—' : `${rate}%`;
  return (
    <span style={{ color: rate == null ? '#5A6474' : color }}>
      {display}
      <small>{total > 0 ? `${hits}/${total}` : ''}</small>
    </span>
  );
}

function StatRow({ label, bucket, color }) {
  const pct = bucket?.rate ?? 0;
  return (
    <div className="la-row">
      <div className="la-row-label">{label}</div>
      <div className="la-row-bar">
        <div
          className="la-row-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="la-row-right">
        <RatePill
          rate={bucket?.rate}
          hits={bucket?.hits ?? 0}
          total={bucket?.total ?? 0}
          color={color}
        />
      </div>
    </div>
  );
}

export default function LeagueAccuracy({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total'); // total | bestPick | sureBet | secondary | correctScore

  const load = (refresh = false) => {
    setLoading(true);
    setError(null);
    accuracyApi
      .leagues(refresh)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(false); }, []);

  const sorted = React.useMemo(() => {
    if (!data?.leagues) return [];
    const copy = [...data.leagues];
    if (sortBy === 'total') {
      return copy.sort((a, b) => b.totalEvaluated - a.totalEvaluated);
    }
    return copy.sort((a, b) => {
      const aR = a[sortBy]?.rate ?? -1;
      const bR = b[sortBy]?.rate ?? -1;
      return bR - aR;
    });
  }, [data, sortBy]);

  const overall = data?.overall;

  return (
    <>
      <style>{LA_STYLES}</style>
      <div className="screen la-wrap">
        <button className="la-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(19px, 5.4vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#E9EEF6' }}>
            Prediction Accuracy
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8792A3' }}>
            Win rates by league, computed from finished matches with predictions
          </p>
          {data?.updated_at && (
            <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#5A6474' }}>
              Updated {new Date(data.updated_at).toLocaleString()}
              {data.cached && ' · cached'}
            </p>
          )}
        </div>

        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            Computing accuracy…
          </div>
        )}

        {error && (
          <div className="card" style={{ color: '#FF6161', fontSize: 12.5, padding: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && overall && (
          <>
            {/* Overall summary */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8792A3' }}>
                  Overall
                </span>
                <span style={{ fontSize: 11, color: '#5A6474' }}>
                  {overall.totalEvaluated} matches
                </span>
              </div>
              <div className="la-grid-4">
                <div className="la-tile">
                  <div className="la-tile-label">Best Pick</div>
                  <div className="la-tile-rate" style={{ color: COLOR_MAP.bestPick }}>
                    {overall.bestPick.rate == null ? '—' : `${overall.bestPick.rate}%`}
                  </div>
                  <div className="la-tile-sub">{overall.bestPick.hits}/{overall.bestPick.total}</div>
                </div>
                <div className="la-tile">
                  <div className="la-tile-label">Sure Bet</div>
                  <div className="la-tile-rate" style={{ color: COLOR_MAP.sureBet }}>
                    {overall.sureBet.rate == null ? '—' : `${overall.sureBet.rate}%`}
                  </div>
                  <div className="la-tile-sub">{overall.sureBet.hits}/{overall.sureBet.total}</div>
                </div>
                <div className="la-tile">
                  <div className="la-tile-label">Secondary</div>
                  <div className="la-tile-rate" style={{ color: COLOR_MAP.secondary }}>
                    {overall.secondary.rate == null ? '—' : `${overall.secondary.rate}%`}
                  </div>
                  <div className="la-tile-sub">{overall.secondary.hits}/{overall.secondary.total}</div>
                </div>
                <div className="la-tile">
                  <div className="la-tile-label">Correct Score</div>
                  <div className="la-tile-rate" style={{ color: COLOR_MAP.correctScore }}>
                    {overall.correctScore.rate == null ? '—' : `${overall.correctScore.rate}%`}
                  </div>
                  <div className="la-tile-sub">{overall.correctScore.hits}/{overall.correctScore.total}</div>
                </div>
              </div>
            </div>

            {/* Sort chips */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10.5, color: '#5A6474', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Sort by
              </div>
              <div className="la-sort-row">
                {[
                  { id: 'total', label: 'Matches' },
                  { id: 'bestPick', label: 'Best Pick %' },
                  { id: 'sureBet', label: 'Sure Bet %' },
                  { id: 'secondary', label: 'Secondary %' },
                  { id: 'correctScore', label: 'Correct Score %' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className="la-sort-btn"
                    onClick={() => setSortBy(opt.id)}
                    style={{
                      background: sortBy === opt.id ? '#C8F751' : '#161B24',
                      color: sortBy === opt.id ? '#0B0E13' : '#8792A3',
                      border: '1px solid ' + (sortBy === opt.id ? '#C8F751' : '#232B37'),
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* League list */}
            <div style={{ marginTop: 14 }}>
              {sorted.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#5A6474', fontSize: 13 }}>
                  No finished matches with predictions yet. Run ingestion + warm cache, wait for matches to finish, then check back.
                </div>
              )}
              {sorted.map((l) => (
                <div className="la-league-card" key={l.league}>
                  <div className="la-league-head">
                    <div className="la-league-name">{l.league}</div>
                    <div className="la-league-count">{l.totalEvaluated} matches</div>
                  </div>
                  <StatRow label="Best Pick" bucket={l.bestPick} color={COLOR_MAP.bestPick} />
                  <StatRow label="Sure Bet" bucket={l.sureBet} color={COLOR_MAP.sureBet} />
                  <StatRow label="Secondary" bucket={l.secondary} color={COLOR_MAP.secondary} />
                  <StatRow label="Correct Score" bucket={l.correctScore} color={COLOR_MAP.correctScore} />
                </div>
              ))}
            </div>

            <button
              onClick={() => load(true)}
              style={{
                marginTop: 16, width: '100%', padding: '12px 14px',
                background: '#161B24', border: '1px solid #232B37',
                borderRadius: 10, color: '#8792A3', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Refresh stats
            </button>
          </>
        )}
      </div>
    </>
  );
}