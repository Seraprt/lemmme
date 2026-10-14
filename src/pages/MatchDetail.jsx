import React, { useEffect, useMemo, useState } from 'react';
import { matchApi } from '../api';
import Crest from '../components/Crest';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import SocialLinks from '../components/SocialLinks';

const pct = (v) => Math.round((v || 0) * 100);
const fmt = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d));

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
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1A2029' }}>
      <div style={{ flex: 1, fontSize: 12.5, color: '#E9EEF6' }}>{labelFor(marketKey)}</div>
      <div style={{ width: 80, height: 6, background: '#1C222C', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: '#C8F751', borderRadius: 3 }} />
      </div>
      <div style={{ width: 44, textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: '#C8F751', fontVariantNumeric: 'tabular-nums' }}>
        {w}%
      </div>
    </div>
  );
}

function ResultPill({ r }) {
  const colors = { W: '#C8F751', D: '#8792A3', L: '#FF6161' };
  return (
    <div
      style={{
        width: 22, height: 22, borderRadius: 5,
        background: colors[r] || '#5A6474', color: '#0B0E13',
        display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11,
      }}
    >
      {r}
    </div>
  );
}

function FormColumn({ team, results, onOpenTeam }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div
          onClick={() => team.id && onOpenTeam(team.id)}
          style={{ cursor: team.id ? 'pointer' : 'default', display: 'flex' }}
        >
          <Crest team={team} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E9EEF6' }}>{team.short || team.name}</div>
      </div>
      {(results || []).length === 0 && (
        <div style={{ fontSize: 11.5, color: '#5A6474', textAlign: 'center', padding: 12 }}>No recent matches</div>
      )}
      {(results || []).map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1A2029' }}>
          <ResultPill r={m.result} />
          <div style={{ flex: 1, fontSize: 12, color: '#B6BEC9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#5A6474' }}>{m.home ? 'vs' : '@'}</span> {m.opponent}
          </div>
          <div style={{ fontSize: 12, color: '#E9EEF6', fontVariantNumeric: 'tabular-nums' }}>{m.score}</div>
        </div>
      ))}
    </div>
  );
}

function SplitStat({ label, v, suffix = '' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
      <span style={{ color: '#8792A3' }}>{label}</span>
      <span style={{ color: '#E9EEF6', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {v == null ? '—' : `${v}${suffix}`}
      </span>
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
      <div className="screen">
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>Loading match…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="screen">
        <div style={{ padding: 20 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 0, color: '#C8F751', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
            ← Back
          </button>
          <div className="card" style={{ textAlign: 'center', padding: 24, color: '#FF6161', fontSize: 13 }}>
            {error || 'Match not found'}
          </div>
        </div>
      </div>
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
    <div className="screen">
      {/* ── Back header ── */}
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: 0, color: '#C8F751', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* ── Match header ── */}
      <div className="card" style={{ padding: '18px 16px' }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#8792A3', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          {data.tournament || 'League'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
          <div
            onClick={() => home.id && onOpenTeam(home.id)}
            style={{ cursor: home.id ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <Crest team={home} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#E9EEF6', textAlign: 'center' }}>{home.name}</div>
            <div style={{ fontSize: 10.5, color: '#5A6474' }}>{home.league || ''}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0 4px' }}>
            <div style={{ fontSize: 11, color: '#5A6474', marginBottom: 4 }}>
              {new Date(data.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C8F751' }}>
              {new Date(data.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div
            onClick={() => away.id && onOpenTeam(away.id)}
            style={{ cursor: away.id ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <Crest team={away} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#E9EEF6', textAlign: 'center' }}>{away.name}</div>
            <div style={{ fontSize: 10.5, color: '#5A6474' }}>{away.league || ''}</div>
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, color: '#5A6474', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Predicted Score
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#C8F751', fontVariantNumeric: 'tabular-nums' }}>
            {data.correct_score ? data.correct_score.replace('-', ' – ') : '—'}
          </div>
          {!is_custom && (
            <div style={{ fontSize: 11.5, color: '#8792A3', marginTop: 4 }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
            <span style={{ color: '#C8F751', fontWeight: 700 }}>{home.short || 'Home'} {homePct}%</span>
            <span style={{ color: '#8792A3', fontWeight: 700 }}>Draw {drawPct}%</span>
            <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{away.short || 'Away'} {awayPct}%</span>
          </div>

          {data.home_xg != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12, color: '#8792A3' }}>
              <span>xG {fmt(data.home_xg)}</span>
              <span style={{ color: '#5A6474', fontSize: 11 }}>Expected Goals</span>
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
          <div style={{ fontSize: 18, fontWeight: 800, color: '#E9EEF6', marginBottom: 4 }}>{data.best_market_label}</div>
          {data.secondary_pick && (
            <div style={{ fontSize: 12, color: '#8792A3' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: `${home.short || 'Home'} +2`, k: 'home_plus_2' },
              { label: `${away.short || 'Away'} +2`, k: 'away_plus_2' },
              { label: `${home.short || 'Home'} +3`, k: 'home_plus_3' },
              { label: `${away.short || 'Away'} +3`, k: 'away_plus_3' },
            ].map((c) => {
              const h = handicap_highlights[c.k] || { probability: 0, confidence: 0 };
              return (
                <div key={c.k} style={{ padding: 12, background: '#11151C', border: '1px solid #232B37', borderRadius: 10 }}>
                  <div style={{ fontSize: 10.5, color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#C8F751', fontVariantNumeric: 'tabular-nums' }}>{pct(h.probability)}%</div>
                    <div style={{ fontSize: 10.5, color: '#8792A3' }}>conf {pct(h.confidence)}%</div>
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
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 6 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: tab === t.id ? '#C8F751' : '#161B24',
                  color: tab === t.id ? '#0B0E13' : '#8792A3',
                  border: '1px solid ' + (tab === t.id ? '#C8F751' : '#232B37'),
                  whiteSpace: 'nowrap',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? '#C8F751' : '#E9EEF6', fontVariantNumeric: 'tabular-nums' }}>
                    {s.score}
                  </div>
                  <div style={{ fontSize: 12, color: i === 0 ? '#C8F751' : '#8792A3', fontWeight: 700 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1A2029' }}>
              <div style={{ fontSize: 10.5, color: '#5A6474', width: 62 }}>
                {new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
              </div>
              <div style={{ flex: 1, fontSize: 12, color: '#E9EEF6', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.home.short || m.home.name}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#C8F751', fontVariantNumeric: 'tabular-nums', padding: '0 8px' }}>
                {m.score}
              </div>
              <div style={{ flex: 1, fontSize: 12, color: '#E9EEF6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.away.short || m.away.name}
              </div>
            </div>
          ))}
        </Section>
      )}

      {!is_custom && (
        <Section title="Home / Away Splits">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11.5, color: '#C8F751', fontWeight: 700, marginBottom: 8 }}>
                {home.short || home.name} (Home)
              </div>
              <SplitStat label="Played" v={splits.home?.played} />
              <SplitStat label="W / D / L" v={splits.home ? `${splits.home.wins}/${splits.home.draws}/${splits.home.losses}` : '—'} />
              <SplitStat label="Goals For" v={splits.home?.avg_gf} suffix="/g" />
              <SplitStat label="Goals Against" v={splits.home?.avg_ga} suffix="/g" />
              <SplitStat label="PPG" v={splits.home?.ppg} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: '#5AA9FF', fontWeight: 700, marginBottom: 8 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attack</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#C8F751', fontWeight: 700 }}>{fmt(home.attack_rating)}</span>
                <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{fmt(away.attack_rating)}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#8792A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Defence</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#C8F751', fontWeight: 700 }}>{fmt(home.defence_rating)}</span>
                <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{fmt(away.defence_rating)}</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: '#5A6474', textAlign: 'center', marginTop: 10 }}>
            League average = 1.00 · Attack higher is better · Defence lower is better
          </div>
        </Section>
      )}

      {!is_custom && factor_bars.length > 0 && (
        <Section title="Factor Breakdown">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#8792A3', marginBottom: 10 }}>
            <span style={{ color: '#C8F751', fontWeight: 700 }}>{home.short || 'Home'}</span>
            <span style={{ color: '#5AA9FF', fontWeight: 700 }}>{away.short || 'Away'}</span>
          </div>
          {factor_bars.map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, color: '#8792A3', marginBottom: 5, textAlign: 'center', letterSpacing: '0.04em' }}>
                {f.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 34, fontSize: 10.5, color: '#C8F751', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {f.home_raw}
                </div>
                <div style={{ position: 'relative', flex: 1, height: 8, background: '#1C222C', borderRadius: 4 }}>
                  <div style={{ position: 'absolute', right: '50%', top: 0, bottom: 0, width: `${f.home * 50}%`, background: '#C8F751', borderRadius: '4px 0 0 4px' }} />
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: `${f.away * 50}%`, background: '#5AA9FF', borderRadius: '0 4px 4px 0' }} />
                </div>
                <div style={{ width: 34, fontSize: 10.5, color: '#5AA9FF', fontVariantNumeric: 'tabular-nums' }}>
                  {f.away_raw}
                </div>
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

      <div style={{ height: 24 }} />
    </div>
  );
}