import React, { useEffect, useState } from 'react';
import { rankingsApi } from '../api';
import Crest from '../components/Crest';
import BannerAd from '../components/BannerAd';
import Smartlink from '../components/Smartlink';

const TR_STYLES = `
  .tr-wrap { padding-bottom: 24px; }

  .tr-back-btn {
    background: transparent; border: 0; color: #C8F751;
    font-size: 13px; font-weight: 700; cursor: pointer; padding: 0;
    display: flex; align-items: center; gap: 6px;
    font-family: inherit; margin-bottom: 14px;
  }
  .tr-back-btn:active { opacity: 0.7; }

  .tr-tabs-row {
    display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;
    margin-bottom: 12px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .tr-tabs-row::-webkit-scrollbar { display: none; }

  .tr-tab-btn {
    padding: 8px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 700;
    cursor: pointer; white-space: nowrap; flex: 0 0 auto;
    transition: 0.15s; font-family: inherit;
  }
  .tr-tab-btn:active { transform: scale(0.97); }

  .tr-row {
    display: grid;
    grid-template-columns: 28px 34px minmax(0, 1fr) 62px;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #11151C;
    border: 1px solid #232B37;
    border-radius: 10px;
    margin-bottom: 6px;
  }

  .tr-rank {
    font-size: 12px; font-weight: 800; text-align: center;
    color: #5A6474; font-variant-numeric: tabular-nums;
  }
  .tr-rank.top3 { color: #C8F751; }
  .tr-rank.bot3 { color: #FF6161; }

  .tr-info { min-width: 0; }
  .tr-name {
    font-size: 13px; font-weight: 700; color: #E9EEF6;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tr-meta {
    font-size: 10.5px; color: #5A6474; margin-top: 2px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tr-bar-track {
    height: 4px; background: #1C222C; border-radius: 2px;
    margin-top: 6px; overflow: hidden;
  }
  .tr-bar-fill { height: 100%; border-radius: 2px; }

  .tr-rating {
    text-align: right; font-variant-numeric: tabular-nums;
  }
  .tr-rating-num {
    font-size: 18px; font-weight: 800; line-height: 1;
  }
  .tr-rating-label {
    font-size: 9.5px; color: #5A6474; margin-top: 2px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  .tr-empty {
    padding: 40px 20px; text-align: center;
    font-size: 12.5px; color: #5A6474; line-height: 1.5;
  }
`;

const TABS = [
  { id: 'home_top', label: 'Best Home', color: '#C8F751' },
  { id: 'away_top', label: 'Best Away', color: '#5AA9FF' },
  { id: 'home_bottom', label: 'Worst Home', color: '#FF6161' },
  { id: 'away_bottom', label: 'Worst Away', color: '#FFB020' },
];

export default function TeamRankings({ onBack }) {
  const [tab, setTab] = useState('home_top');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    rankingsApi
      .list(tab, { limit: 20, minMatches: 10 })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];
  const accent = activeTab.color;

  return (
    <>
      <style>{TR_STYLES}</style>
      <div className="screen tr-wrap">
        <button className="tr-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(19px, 5.4vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#E9EEF6' }}>
            Team Strength Rankings
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8792A3', lineHeight: 1.4 }}>
            Rated 1–100 from points-per-game. Min 10 matches to qualify.
          </p>
        </div>

        {/* Top banner ad */}
        <BannerAd height={250} width={300} />

        <div className="tr-tabs-row">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tr-tab-btn"
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? t.color : '#161B24',
                color: tab === t.id ? '#0B0E13' : '#8792A3',
                border: '1px solid ' + (tab === t.id ? t.color : '#232B37'),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            Loading rankings…
          </div>
        )}

        {error && (
          <div className="card" style={{ color: '#FF6161', fontSize: 12.5, padding: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && data?.results?.length === 0 && (
          <div className="tr-empty">
            No teams have played at least 10 {tab.startsWith('home') ? 'home' : 'away'} matches yet.
            <br />
            Run ingestion to build up match history.
          </div>
        )}

        {!loading && !error && data?.results?.map((t, idx) => {
          const isTop3 = idx < 3;
          const isBot3 = idx >= data.results.length - 3 && data.results.length >= 6;
          const rankClass = tab.endsWith('bottom')
            ? (isBot3 && idx < 3 ? 'bot3' : '')
            : (isTop3 ? 'top3' : '');
          return (
            <div className="tr-row" key={t.team_id}>
              <div className={`tr-rank ${rankClass}`}>{idx + 1}</div>
              <Crest team={t} />
              <div className="tr-info">
                <div className="tr-name">{t.name}</div>
                <div className="tr-meta">
                  {t.league || '—'} · {t.ppg.toFixed(2)} PPG · {t.played} played
                </div>
                <div className="tr-bar-track">
                  <div
                    className="tr-bar-fill"
                    style={{
                      width: `${t.rating}%`,
                      background: accent,
                    }}
                  />
                </div>
              </div>
              <div className="tr-rating">
                <div className="tr-rating-num" style={{ color: accent }}>{t.rating}</div>
                <div className="tr-rating-label">Rating</div>
              </div>
            </div>
          );
        })}

        {!loading && !error && data?.total_eligible > 20 && (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10.5, color: '#5A6474' }}>
            Showing top 20 of {data.total_eligible} qualifying teams
          </div>
        )}

        {/* Bottom smartlink */}
        <div style={{ marginTop: 16 }}>
          <Smartlink text="Sponsored" type="monetag" />
        </div>

        <div style={{ height: 24 }} />
      </div>
    </>
  );
}