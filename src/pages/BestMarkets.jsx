import React, { useEffect, useState } from 'react';
import { marketsApi } from '../api';
import Crest from '../components/Crest';
import BannerAd from '../components/BannerAd';
import Smartlink from '../components/Smartlink';

const pct = (v) => Math.round((v || 0) * 100);

const BM_STYLES = `
  .bm-wrap { padding-bottom: 24px; }

  .bm-tabs {
    display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;
    margin-bottom: 12px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .bm-tabs::-webkit-scrollbar { display: none; }

  .bm-tab {
    padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
    cursor: pointer; white-space: nowrap; flex: 0 0 auto;
    transition: 0.15s; font-family: inherit;
  }
  .bm-tab:active { transform: scale(0.97); }

  .bm-pick {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    padding: 12px 14px;
    background: #11151C;
    border: 1px solid #232B37;
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: 0.15s;
  }
  .bm-pick:active { transform: scale(0.99); }

  .bm-pick-left { min-width: 0; }
  .bm-teams {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px; min-width: 0;
  }
  .bm-teams-names {
    font-size: 13px; font-weight: 700; color: #E9EEF6;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    flex: 1; min-width: 0;
  }
  .bm-league {
    font-size: 10.5px; color: #5A6474; margin-bottom: 6px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .bm-market {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(200,247,81,0.12);
    border: 1px solid rgba(200,247,81,0.30);
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 800;
    color: #C8F751;
    letter-spacing: 0.02em;
  }

  .bm-pick-right {
    display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
    flex: 0 0 auto;
  }
  .bm-prob {
    font-size: 22px; font-weight: 800; color: #C8F751;
    font-variant-numeric: tabular-nums; line-height: 1;
  }
  .bm-prob-label {
    font-size: 9.5px; color: #5A6474; text-transform: uppercase;
    letter-spacing: 0.06em; font-weight: 700;
  }
  .bm-conf {
    font-size: 10.5px; color: #8792A3; margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }

  .bm-acc-card {
    background: linear-gradient(140deg, rgba(200,247,81,0.10), rgba(200,247,81,0.02));
    border: 1px solid rgba(200,247,81,0.28);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .bm-acc-left { min-width: 0; }
  .bm-acc-label {
    font-size: 10.5px; color: #8792A3; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .bm-acc-value {
    font-size: 26px; font-weight: 900; color: #C8F751;
    line-height: 1; font-variant-numeric: tabular-nums;
  }
  .bm-acc-sub {
    font-size: 11px; color: #5A6474; margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }
  .bm-acc-right {
    font-size: 10.5px; color: #8792A3; text-align: right;
    max-width: 130px; line-height: 1.4;
  }
`;

const TABS = [
  { id: 'under', label: 'Under Markets' },
  { id: 'over', label: 'Over Markets' },
  { id: 'dc', label: 'Double Chance' },
  { id: '1x2', label: '1X2' },
];

export default function BestMarkets({ onOpenMatch }) {
  const [tab, setTab] = useState('under');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    marketsApi
      .best(tab, { days: 7, limit: 200 })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  const acc = data?.category_accuracy;
  const picks = data?.picks || [];

  return (
    <>
      <style>{BM_STYLES}</style>
      <div className="screen bm-wrap">
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(19px, 5.4vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#E9EEF6' }}>
            Best Market Picks
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8792A3', lineHeight: 1.4 }}>
            Top picks per market category, ranked by probability × confidence
          </p>
        </div>

        {/* Category tabs */}
        <div className="bm-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="bm-tab"
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? '#C8F751' : '#161B24',
                color: tab === t.id ? '#0B0E13' : '#8792A3',
                border: '1px solid ' + (tab === t.id ? '#C8F751' : '#232B37'),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category accuracy card */}
        {!loading && !error && acc && (
          <div className="bm-acc-card">
            <div className="bm-acc-left">
              <div className="bm-acc-label">Category Success Rate</div>
              <div className="bm-acc-value">
                {acc.rate == null ? '—' : `${acc.rate}%`}
              </div>
              <div className="bm-acc-sub">
                {acc.total > 0
                  ? `${acc.hits} hits / ${acc.total} finishes`
                  : 'No finished matches with this category yet'}
              </div>
            </div>
            <div className="bm-acc-right">
              Historical accuracy of the model's top pick in this category
            </div>
          </div>
        )}

        {/* Top banner */}
        <BannerAd height={250} width={300} />

        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            Loading picks…
          </div>
        )}

        {error && (
          <div className="card" style={{ color: '#FF6161', fontSize: 12.5, padding: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && picks.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#5A6474', fontSize: 13, lineHeight: 1.5 }}>
            No {TABS.find((t) => t.id === tab)?.label.toLowerCase()} picks available in the next 7 days.
            <br />
            Check back after the next cache warm.
          </div>
        )}

        {!loading && !error && picks.map((p) => (
          <div
            key={p.match_id}
            className="bm-pick"
            onClick={() => onOpenMatch && onOpenMatch(p.match_id)}
          >
            <div className="bm-pick-left">
              <div className="bm-league">{p.tournament || 'League'}</div>
              <div className="bm-teams">
                <Crest team={p.home} />
                <div className="bm-teams-names">
                  {p.home.name} vs {p.away.name}
                </div>
                <Crest team={p.away} />
              </div>
              <div>
                <span className="bm-market">{p.market_label}</span>
                {p.correct_score && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#5A6474', fontWeight: 600 }}>
                    Score: {p.correct_score}
                  </span>
                )}
              </div>
            </div>
            <div className="bm-pick-right">
              <div className="bm-prob">{pct(p.probability)}%</div>
              <div className="bm-prob-label">Chance</div>
              <div className="bm-conf">conf {pct(p.confidence)}%</div>
            </div>
          </div>
        ))}

        {!loading && !error && picks.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <Smartlink text="Sponsored" type="monetag" />
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </>
  );
}