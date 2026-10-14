import React, { useEffect, useMemo, useState } from 'react';
import { matchApi } from '../api';
import Crest from '../components/Crest';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import SocialLinks from '../components/SocialLinks';

const pct = (v) => Math.round((v || 0) * 100);
const fmt = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d));

// ══════════════════════════════════════════════
// Scoped responsive CSS
// ══════════════════════════════════════════════
const MD_STYLES = `
  .md-wrap { padding-bottom: 24px; }

  .md-header-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: start;
    gap: clamp(6px, 2.5vw, 12px);
  }
  .md-team-col {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .md-team-name {
    font-size: clamp(11px, 3.6vw, 13.5px);
    font-weight: 700;
    color: #E9EEF6;
    text-align: center;
    line-height: 1.2;
    overflow-wrap: anywhere;
    word-break: break-word;
    max-width: 100%;
  }
  .md-team-league {
    font-size: clamp(9.5px, 2.8vw, 10.5px);
    color: #5A6474;
    text-align: center;
    overflow-wrap: anywhere;
    line-height: 1.2;
    max-width: 100%;
  }
  .md-center-col {
    text-align: center;
    padding: 0 2px;
    min-width: 44px;
  }
  .md-date-line {
    font-size: clamp(10px, 2.9vw, 11px);
    color: #5A6474;
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .md-time-line {
    font-size: clamp(12px, 3.4vw, 13px);
    font-weight: 700;
    color: #C8F751;
    white-space: nowrap;
  }

  .md-predicted-score {
    font-size: clamp(22px, 8vw, 30px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #C8F751;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .md-tabs-row {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-bottom: 6px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .md-tabs-row::-webkit-scrollbar { display: none; }

  .md-tab-btn {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: clamp(11px, 3vw, 12px);
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    flex: 0 0 auto;
    transition: 0.15s;
    font-family: inherit;
  }
  .md-tab-btn:active { transform: scale(0.97); }

  .md-market-row {
    display: flex;
    align-items: center;
    gap: clamp(6px, 2vw, 10px);
    padding: 8px 0;
    border-bottom: 1px solid #1A2029;
  }
  .md-market-label {
    flex: 1 1 auto;
    min-width: 0;
    font-size: clamp(11.5px, 3.2vw, 12.5px);
    color: #E9EEF6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .md-market-bar-wrap {
    flex: 0 0 auto;
    width: clamp(50px, 22vw, 80px);
    height: 6px;
    background: #1C222C;
    border-radius: 3px;
    overflow: hidden;
  }
  .md-market-value {
    flex: 0 0 auto;
    width: 44px;
    text-align: right;
    font-size: clamp(11.5px, 3.2vw, 12.5px);
    font-weight: 700;
    color: #C8F751;
    font-variant-numeric: tabular-nums;
  }

  .md-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(8px, 2.4vw, 16px);
  }
  .md-grid-handicap {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(6px, 2vw, 8px);
  }
  @media (max-width: 340px) {
    .md-grid-handicap { grid-template-columns: minmax(0, 1fr); }
  }

  .md-grid-scores {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 6px;
  }

  .md-form-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
    border-bottom: 1px solid #1A2029;
  }
  .md-form-opp {
    flex: 1 1 auto;
    min-width: 0;
    font-size: clamp(11px, 3vw, 12px);
    color: #B6BEC9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .md-form-score {
    flex: 0 0 auto;
    font-size: clamp(11px, 3vw, 12px);
    color: #E9EEF6;
    font-variant-numeric: tabular-nums;
  }

  .md-h2h-row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    border-bottom: 1px solid #1A2029;
    font-size: clamp(11px, 3vw, 12px);
  }
  .md-h2h-date {
    color: #5A6474;
    font-size: clamp(9.5px, 2.8vw, 10.5px);
    white-space: nowrap;
  }
  .md-h2h-team {
    color: #E9EEF6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .md-h2h-score {
    font-weight: 800;
    color: #C8F751;
    font-variant-numeric: tabular-nums;
    padding: 0 4px;
    font-size: clamp(11.5px, 3.2vw, 12.5px);
  }

  .md-split-label {
    font-size: clamp(11px, 3vw, 11.5px);
    font-weight: 700;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .md-split-row {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    padding: 5px 0;
    font-size: clamp(11px, 3vw, 12px);
  }
  .md-split-row > span:first-child {
    color: #8792A3;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .md-split-row > span:last-child {
    color: #E9EEF6;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    flex: 0 0 auto;
  }

  .md-factors-title {
    display: flex;
    justify-content: space-between;
    font-size: clamp(10px, 2.9vw, 10.5px);
    color: #8792A3;
    margin-bottom: 10px;
    gap: 6px;
  }
  .md-factor-label {
    font-size: clamp(10px, 2.9vw, 10.5px);
    color: #8792A3;
    margin-bottom: 5px;
    text-align: center;
    letter-spacing: 0.04em;
  }
  .md-factor-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .md-factor-num {
    width: 32px;
    font-size: clamp(10px, 2.9vw, 10.5px);
    font-variant-numeric: tabular-nums;
    flex: 0 0 auto;
  }
  .md-factor-track {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    height: 8px;
    background: #1C222C;
    border-radius: 4px;
  }

  .md-back-btn {
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
  }
  .md-back-btn:active { opacity: 0.7; }
`;

// ══════════════════════════════════════════════
// Market labels
// ══════════════════════════════════════════════
const MARKET_LABELS = {
  home_win: 'Home Win', draw: 'Draw', away_win: 'Away Win',
  '1X': 'Home or Draw', 'X2': 'Draw or Away', '12': 'Home or Away',
  dnb_home: 'Draw No Bet – Home', dnb_away: 'Draw No Bet – Away',
  btts_yes: 'BTTS – Yes', btts_no: 'BTTS – No',
  'over_0.5': 'Over 0.5', 'over_1.5': 'Over 1.5', 'over_2.5': 'Over 2.5', 'over_3.5': 'Over 3.5', 'over_4.5': 'Over 4.5',
  'under_0.5': 'Under 0.5', 'under_1.5': 'Under 1.5', 'under_2.5': 'Under 2.5', 'under_3.5': 'Under 3.5', 'under_4.5': 'Under 4.5',
  odd: 'Odd Goals', even: 'Even Goals',
  'home_over_0.5': 'Home Over 0.5', 'home_over_1.5': 'Home Over 1.5', 'home_over_2.5': 'Home Over 2.5',
  'home_under_0.5': 'Home Under 0.5', 'home_under_1.5': 'Home Under 1.5', 'home_under_2.5': 'Home Under 2.5',
  'away_over_0.5': 'Away Over 0.5', 'away_over_1.5': 'Away Over 1.5', 'away_over_2.5': 'Away Over 2.5',
  'away_under_0.5': 'Away Under 0.5', 'away_under_1.5': 'Away Under 1.5', 'away_under_2.5': 'Away Under 2.5',
  home_clean_sheet: 'Home Clean Sheet', away_clean_sheet: 'Away Clean Sheet',
  home_win_to_nil: 'Home Win to Nil', away_win_to_nil: 'Away Win to Nil',
  home_score_first: 'Home Scores First', away_score_first: 'Away Scores First',
  no_goals: 'No Goals (0-0)',
  home_win_by_1: 'Home Win by 1', home_win_by_2: 'Home Win by 2', home_win_by_3plus: 'Home Win by 3+',
  away_win_by_1: 'Away Win by 1', away_win_by_2: 'Away Win by 2', away_win_by_3plus: 'Away Win by 3+',
  btts_and_over_2_5: 'BTTS & Over 2.5', btts_and_under_2_5: 'BTTS & Under 2.5',
  no_btts_and_over_2_5: 'No BTTS & Over 2.5', no_btts_and_under_2_5: 'No BTTS & Under 2.5',
  home_win_btts_yes: 'Home Win & BTTS', home_win_btts_no: 'Home Win & No BTTS',
  draw_btts_yes: 'Draw & BTTS', draw_btts_no: 'Draw & No BTTS',
  away_win_btts_yes: 'Away Win & BTTS', away_win_btts_no: 'Away Win & No BTTS',
  'any_team_over_2.5_goals': 'Any Team Over 2.5',
  'any_team_under_2.5_goals': 'Any Team Under 2.5',
};

function labelFor(key) {
  if (MARKET_LABELS[key]) return MARKET_LABELS[key];
  if (/^home_\+\d/.test(key)) return `Home +${key.split('+')[1]}`;
  if (/^away_\+\d/.test(key)) return `Away +${key.split('+')[1]}`;
  if (/^home_-\d/.test(key)) return `Home ${key.split('home')[1]}`;
  if (/^away_-\d/.test(key)) return `Away ${key.split('away')[1]}`;
  return key.replace(/_/g, ' ');
}

const TABS = [
  { id: 'result', label: 'Result' },
  { id: 'goals', label: 'Goals' },
  { id: 'team', label: 'Team Goals' },
  { id: 'handicap', label: 'Handicaps' },
  { id: 'margin', label: 'Winning Margin' },
  { id: 'score', label: 'Correct Score' },
];

const TAB_MARKETS = {
  result: [
    'home_win', 'draw', 'away_win', '1X', 'X2', '12',
    'dnb_home', 'dnb_away',
    'home_win_btts_yes', 'home_win_btts_no',
    'draw_btts_yes', 'draw_btts_no',
    'away_win_btts_yes', 'away_win_btts_no',
  ],
  goals: [
    'over_0.5', 'over_1.5', 'over_2.5', 'over_3.5', 'over_4.5',
    'under_0.5', 'under_1.5', 'under_2.5', 'under_3.5', 'under_4.5',
    'btts_yes', 'btts_no', 'odd', 'even',
    'btts_and_over_2_5', 'btts_and_under_2_5',
    'no_btts_and_over_2_5', 'no_btts_and_under_2_5',
  ],
  team: [
    'home_over_0.5', 'home_over_1.5', 'home_over_2.5',
    'home_under_0.5', 'home_under_1.5', 'home_under_2.5',
    'away_over_0.5', 'away_over_1.5', 'away_over_2.5',
    'away_under_0.5', 'away_under_1.5', 'away_under_2.5',
    'home_clean_sheet', 'away_clean_sheet',
    'home_win_to_nil', 'away_win_to_nil',
    'home_score_first', 'away_score_first',
    'no_goals',
  ],
  handicap: [
    'home_+1', 'home_+2', 'home_+3',
    'away_+1', 'away_+2', 'away_+3',
    'home_-1', 'home_-2', 'home_-3',
    'away_-1', 'away_-2', 'away_-3',
    'home_+1.5', 'home_-1.5',
    'away_+1.5', 'away_-1.5',
  ],
  margin: [
    'home_win_by_1', 'home_win_by_2', 'home_win_by_3plus',
    'away_win_by_1', 'away_win_by_2', 'away_win_by_3plus',
  ],
};

// ══════════════════════════════════════════════
// Small UI atoms
// ══════════════════════════════════════════════
function SvgChart({ rows }) {
  const W = 340;
  const rowH = 26;
  const H = rows.length * rowH + 6;
  const labelW = 92;
  const valW = 44;
  const chartW = W - labelW - valW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {rows.map((r, i) => {
        const y = i * rowH + 4;
        const w = Math.max(2, (r.v || 0) * chartW);
        return (
          <g key={r.label}>
            <text x={0} y={y + 14} fill="#8792A3" fontSize="11" fontFamily="system-ui">{r.label}</text>
            <rect x={labelW} y={y} width={chartW} height="16" rx="4" fill="#1C222C" />
            <rect x={labelW} y={y} width={w} height="16" rx="4" fill={r.color} />
            <text x={W} y={y + 12} fill="#E9EEF6" fontSize="11" textAnchor="end" fontFamily="system-ui" fontWeight="700">
              {pct(r.v)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Section({ title, children, style = {} }) {
  return (
    <div className="card" style={{ marginTop: 14, ...style }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8792A3' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MarketRow({ marketKey, prob }) {
  const w = pct(prob);
  return (
    <div className="md-market-row">
      <div className="md-market-label" title={labelFor(marketKey)}>{labelFor(marketKey)}</div>
      <div className="md-market-bar-wrap">
        <div style={{ width: `${w}%`, height: '100%', background: '#C8F751', borderRadius: 3 }} />
      </div>
      <div className="md-market-value">{w}%</div>
    </div>
  );
}

function ResultPill({ r }) {
  const colors = { W: '#C8F751', D: '#8792A3', L: '#FF6161' };
  return (
    <div
      style={{
        width: 20, height: 20, borderRadius: 5, flex: '0 0 auto',
        background: colors[r] || '#5A6474', color: '#0B0E13',
        display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 10.5,
      }}
    >
      {r}
    </div>
  );
}

function FormColumn({ team, results, onOpenTeam }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, minWidth: 0 }}>
        <div
          onClick={() => team.id && onOpenTeam(team.id)}
          style={{ cursor: team.id ? 'pointer' : 'default', display: 'flex', flex: '0 0 auto' }}
        >
          <Crest team={team} />
        </div>
        <div style={{ fontSize: 'clamp(11px, 3.4vw, 13px)', fontWeight: 700, color: '#E9EEF6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {team.short || team.name}
        </div>
      </div>
      {(results || []).length === 0 && (
        <div style={{ fontSize: 11, color: '#5A6474', textAlign: 'center', padding: 12 }}>No recent matches</div>
      )}
      {(results || []).map((m, i) => (
        <div className="md-form-row" key={i}>
          <ResultPill r={m.result} />
          <div className="md-form-opp">
            <span style={{ color: '#5A6474' }}>{m.home ? 'vs' : '@'}</span> {m.opponent}
          </div>
          <div className="md-form-score">{m.score}</div>
        </div>
      ))}
    </div>
  );
}

function SplitStat({ label, v, suffix = '' }) {
  return (
    <div className="md-split-row">
      <span>{label}</span>
      <span>{v == null ? '—' : `${v}${suffix}`}</span>
    </div>
  );
}

// ══════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════
export default function MatchDetail({ matchId, onBack, onOpenTeam }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('result');

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchApi
      .detail(matchId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [matchId]);

  const chartRows = useMemo(() => {
    const p = data?.markets_full || {};
    return [
      { label: 'Home Win', v: p.home_win, color: '#C8F751' },
      { label: 'Draw', v: p.draw, color: '#8792A3' },
      { label: 'Away Win', v: p.away_win, color: '#5AA9FF' },
      { label: 'BTTS Yes', v: p.btts_yes, color: '#FFB020' },
      { label: 'Over 2.5', v: p['over_2.5'], color: '#3ED598' },
      { label: 'Under 3.5', v: p['under_3.5'], color: '#A78BFA' },
    ];
  }, [data]);

  if (loading) {
    return (
      <>
        <style>{MD_STYLES}</style>
        <div className="screen">
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>Loading match…</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <style>{MD_STYLES}</style>
        <div className="screen">
          <div style={{ padding: 20 }}>
            <button className="md-back-btn" onClick={onBack} style={{ marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="card" style={{ textAlign: 'center', padding: 24, color: '#FF6161', fontSize: 13 }}>
              {error || 'Match not found'}
            </div>
          </div>
        </div>
      </>
    );
  }

  const {
    home, away, markets_full = {}, handicap_highlights = {},
    form_data = {}, h2h_data = [], splits = {}, factor_bars = [],
    correct_score_grid = [], reasons = [], is_custom,
  } = data;

  const homePct = pct(data.home_win_prob);
  const drawPct = pct(data.draw_prob);
  const awayPct = pct(data.away_win_prob);
  const confidencePct = pct(data.confidence);

  return (
    <>
      <style>{MD_STYLES}</style>
      <div className="screen md-wrap">
        {/* ── Back ── */}
        <div style={{ marginBottom: 14 }}>
          <button className="md-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ── Match header ── */}
        <div className="card" style={{ padding: 'clamp(14px, 4vw, 18px) clamp(12px, 3.4vw, 16px)' }}>
          <div style={{ textAlign: 'center', fontSize: 'clamp(10px, 2.9vw, 11px)', color: '#8792A3', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.tournament || 'League'}
          </div>

          <div className="md-header-grid">
            <div className="md-team-col" onClick={() => home.id && onOpenTeam(home.id)}>
              <Crest team={home} />
              <div className="md-team-name">{home.name}</div>
              <div className="md-team-league">{home.league || ''}</div>
            </div>

            <div className="md-center-col">
              <div className="md-date-line">
                {new Date(data.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
              </div>
              <div className="md-time-line">
                {new Date(data.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="md-team-col" onClick={() => away.id && onOpenTeam(away.id)}>
              <Crest team={away} />
              <div className="md-team-name">{away.name}</div>
              <div className="md-team-league">{away.league || ''}</div>
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(10px, 2.9vw, 10.5px)', color: '#5A6474', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Predicted Score
            </div>
            <div className="md-predicted-score">
              {data.correct_score ? data.correct_score.replace('-', ' – ') : '—'}
            </div>
            {!is_custom && (
              <div style={{ fontSize: 'clamp(10.5px, 3vw, 11.5px)', color: '#8792A3', marginTop: 4 }}>
                Model confidence {confidencePct}%
              </div>
            )}
          </div>
        </div>

        {is_custom && (
          <div className="card" style={{ background: 'rgba(255,176,32,0.06)', borderColor: 'rgba(255,176,32,0.25)', color: '#FFB020', fontSize: 12.5, padding: 14 }}>
            {data.custom_notice}
          </div>
        )}

        {!is_custom && (
          <Section title="Match Result Probability">
            <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: '#1C222C', marginBottom: 10 }}>
              <div style={{ width: `${homePct}%`, background: '#C8F751' }} />
              <div style={{ width: `${drawPct}%`, background: '#8792A3' }} />
              <div style={{ width: `${awayPct}%`, background: '#5AA9FF' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10.5px, 3vw, 11.5px)', gap: 4 }}>
              <span style={{ color: '#C8F751', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home.short || 'Home'} {homePct}%</span>
              <span style={{ color: '#8792A3', fontWeight: 700, flex: '0 0 auto' }}>Draw {drawPct}%</span>
              <span style={{ color: '#5AA9FF', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{away.short || 'Away'} {awayPct}%</span>
            </div>

            {data.home_xg != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 'clamp(11px, 3vw, 12px)', color: '#8792A3' }}>
                <span>xG {fmt(data.home_xg)}</span>
                <span style={{ color: '#5A6474', fontSize: 'clamp(10px, 2.9vw, 11px)' }}>Expected Goals</span>
                <span>xG {fmt(data.away_xg)}</span>
              </div>
            )}
          </Section>
        )}

        {!is_custom && data.best_market_label && (
          <div className="card" style={{ background: 'linear-gradient(140deg, rgba(200,247,81,0.10), rgba(200,247,81,0.02))', borderColor: 'rgba(200,247,81,0.30)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#C8F751', marginBottom: 6 }}>
              Best Pick
            </div>
            <div style={{ fontSize: 'clamp(15px, 4.6vw, 18px)', fontWeight: 800, color: '#E9EEF6', marginBottom: 4, overflowWrap: 'anywhere' }}>
              {data.best_market_label}
            </div>
            {data.secondary_pick && (
              <div style={{ fontSize: 'clamp(11px, 3.2vw, 12px)', color: '#8792A3' }}>
                Also consider: <span style={{ color: '#E9EEF6', fontWeight: 600 }}>{data.secondary_pick.label}</span> ({pct(data.secondary_pick.probability)}%)
              </div>
            )}
          </div>
        )}

        {!is_custom && (
          <Section title="Probability Profile">
            <SvgChart rows={chartRows} />
          </Section>
        )}

        {!is_custom && (
          <Section title="Handicap Highlights (+2 / +3)">
            <div className="md-grid-handicap">
              {[
                { label: `${home.short || 'Home'} +2`, k: 'home_plus_2' },
                { label: `${away.short || 'Away'} +2`, k: 'away_plus_2' },
                { label: `${home.short || 'Home'} +3`, k: 'home_plus_3' },
                { label: `${away.short || 'Away'} +3`, k: 'away_plus_3' },
              ].map((c) => {
                const h = handicap_highlights[c.k] || { probability: 0, confidence: 0 };
                return (
                  <div key={c.k} style={{ padding: 12, background: '#11151C', border: '1px solid #232B37', borderRadius: 10, minWidth: 0 }}>
                    <div style={{ fontSize: 'clamp(10px, 2.9vw, 10.5px)', color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 6 }}>
                      <div style={{ fontSize: 'clamp(18px, 5.4vw, 22px)', fontWeight: 800, color: '#C8F751', fontVariantNumeric: 'tabular-nums' }}>{pct(h.probability)}%</div>
                      <div style={{ fontSize: 'clamp(9.5px, 2.8vw, 10.5px)', color: '#8792A3', whiteSpace: 'nowrap' }}>conf {pct(h.confidence)}%</div>
                    </div>
                    <div style={{ height: 5, background: '#1C222C', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct(h.probability)}%`, height: '100%', background: '#C8F751' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {!is_custom && (
          <Section title="All Markets">
            <div className="md-tabs-row">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className="md-tab-btn"
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

            {tab !== 'score' && (
              <div>
                {(TAB_MARKETS[tab] || []).map((k) => {
                  const v = markets_full[k];
                  if (v == null) return null;
                  return <MarketRow key={k} marketKey={k} prob={v} />;
                })}
              </div>
            )}

            {tab === 'score' && (
              <div className="md-grid-scores">
                {correct_score_grid.slice(0, 12).map((s, i) => (
                  <div
                    key={s.score}
                    style={{
                      padding: '10px 12px',
                      background: i === 0 ? 'rgba(200,247,81,0.10)' : '#11151C',
                      border: '1px solid ' + (i === 0 ? 'rgba(200,247,81,0.30)' : '#232B37'),
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 800, color: i === 0 ? '#C8F751' : '#E9EEF6', fontVariantNumeric: 'tabular-nums' }}>
                      {s.score}
                    </div>
                    <div style={{ fontSize: 'clamp(11px, 3.2vw, 12px)', color: i === 0 ? '#C8F751' : '#8792A3', fontWeight: 700 }}>
                      {pct(s.probability)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {!is_custom && (
          <Section title="Recent Form (Last 5)">
            <div className="md-grid-2">
              <FormColumn team={home} results={form_data.home} onOpenTeam={onOpenTeam} />
              <FormColumn team={away} results={form_data.away} onOpenTeam={onOpenTeam} />
            </div>
          </Section>
        )}

        {!is_custom && (
          <Section title="Head to Head">
            {(h2h_data || []).length === 0 && (
              <div style={{ fontSize: 12, color: '#5A6474', textAlign: 'center', padding: 12 }}>
                No previous meetings on record.
              </div>
            )}
            {(h2h_data || []).map((m, i) => (
              <div className="md-h2h-row" key={i}>
                <div className="md-h2h-date">
                  {new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
                </div>
                <div className="md-h2h-team" style={{ textAlign: 'right' }}>
                  {m.home.short || m.home.name}
                </div>
                <div className="md-h2h-score">{m.score}</div>
                <div className="md-h2h-team">{m.away.short || m.away.name}</div>
              </div>
            ))}
          </Section>
        )}

        {!is_custom && (
          <Section title="Home / Away Splits">
            <div className="md-grid-2">
              <div style={{ minWidth: 0 }}>
                <div className="md-split-label" style={{ color: '#C8F751' }}>
                  {home.short || home.name} (Home)
                </div>
                <SplitStat label="Played" v={splits.home?.played} />
                <SplitStat label="W / D / L" v={splits.home ? `${splits.home.wins}/${splits.home.draws}/${splits.home.losses}` : '—'} />
                <SplitStat label="Goals For" v={splits.home?.avg_gf} suffix="/g" />
                <SplitStat label="Goals Against" v={splits.home?.avg_ga} suffix="/g" />
                <SplitStat label="PPG" v={splits.home?.ppg} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="md-split-label" style={{ color: '#5AA9FF' }}>
                  {away.short || away.name} (Away)
                </div>
                <SplitStat label="Played" v={splits.away?.played} />
                <SplitStat label="W / D / L" v={splits.away ? `${splits.away.wins}/${splits.away.draws}/${splits.away.losses}` : '—'} />
                <SplitStat label="Goals For" v={splits.away?.avg_gf} suffix="/g" />
                <SplitStat label="Goals Against" v={splits.away?.avg_ga} suffix="/g" />
                <SplitStat label="PPG" v={splits.away?.ppg} />
              </div>
            </div>
          </Section>
        )}

        {!is_custom && (
          <Section title="Attack / Defence Ratings">
            <div className="md-grid-2">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(10.5px, 3vw, 11px)', color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attack</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(11.5px, 3.2vw, 12.5px)', gap: 6 }}>
                  <span style={{ color: '#C8F751', fontWeight: 700 }}>{fmt(home.attack_rating)}</span>
                  <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{fmt(away.attack_rating)}</span>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(10.5px, 3vw, 11px)', color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Defence</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(11.5px, 3.2vw, 12.5px)', gap: 6 }}>
                  <span style={{ color: '#C8F751', fontWeight: 700 }}>{fmt(home.defence_rating)}</span>
                  <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{fmt(away.defence_rating)}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'clamp(9.5px, 2.8vw, 10.5px)', color: '#5A6474', textAlign: 'center', marginTop: 10 }}>
              League average = 1.00 · Attack higher is better · Defence lower is better
            </div>
          </Section>
        )}

        {!is_custom && factor_bars.length > 0 && (
          <Section title="Factor Breakdown">
            <div className="md-factors-title">
              <span style={{ color: '#C8F751', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home.short || 'Home'}</span>
              <span style={{ color: '#5AA9FF', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{away.short || 'Away'}</span>
            </div>
            {factor_bars.map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <div className="md-factor-label">{f.label}</div>
                <div className="md-factor-row">
                  <div className="md-factor-num" style={{ color: '#C8F751', textAlign: 'right' }}>{f.home_raw}</div>
                  <div className="md-factor-track">
                    <div style={{ position: 'absolute', right: '50%', top: 0, bottom: 0, width: `${f.home * 50}%`, background: '#C8F751', borderRadius: '4px 0 0 4px' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: `${f.away * 50}%`, background: '#5AA9FF', borderRadius: '0 4px 4px 0' }} />
                  </div>
                  <div className="md-factor-num" style={{ color: '#5AA9FF' }}>{f.away_raw}</div>
                </div>
              </div>
            ))}
          </Section>
        )}

        {!is_custom && reasons.length > 0 && (
          <Section title="Why These Picks">
            <div className="why">
              {reasons.map((r, i) => (
                <div className="reason" data-tone={r.tone} key={i}>
                  <span className="reason-w">{Math.round((r.weight || 0) * 100)}</span>
                  <span className="reason-tag">{r.tag}</span>
                  <p className="reason-title">{r.title}</p>
                  <p className="reason-text">{r.text}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div style={{ marginTop: 16 }}>
          <BannerAd height={250} width={300} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Smartlink text="Sponsored" type="monetag" />
        </div>

        <SocialLinks title="Follow Formline" />
      </div>
    </>
  );
}