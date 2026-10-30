import React, { useEffect, useMemo, useState } from 'react';
import { matchApi, dailyMessageApi } from '../api';
import Crest from '../components/Crest';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import SocialLinks from '../components/SocialLinks';

const pct = (v) => Math.round((v || 0) * 100);

function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const bot = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  if (offset === 0) return { top: 'Today', bot };
  if (offset === 1) return { top: 'Tmrw', bot };
  return { top: d.toLocaleDateString(undefined, { weekday: 'short' }), bot };
}

function prettyDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function derivePick(match) {
  if (match.best_market_label) return match.best_market_label;
  if (match.pick) return match.pick;
  const homeWin = match.home_win_prob || 0;
  const awayWin = match.away_win_prob || 0;
  const draw = match.draw_prob || 0;
  if (homeWin > awayWin && homeWin > draw) return `${match.home?.name} win`;
  if (awayWin > homeWin && awayWin > draw) return `${match.away?.name} win`;
  return 'Draw';
}

// ── Daily message card ──
function DailyMessageCard({ heading, body }) {
  return (
    <div
      style={{
        background: 'linear-gradient(140deg, rgba(200,247,81,0.10), rgba(200,247,81,0.02))',
        border: '1px solid rgba(200,247,81,0.28)',
        borderRadius: 14,
        padding: '16px 16px 18px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: '#C8F751',
            background: 'rgba(200,247,81,0.14)', padding: '3px 8px', borderRadius: 6,
          }}
        >
          Daily Update
        </span>
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#E9EEF6' }}>
        {heading}
      </h3>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#B6BEC9', whiteSpace: 'pre-wrap' }}>
        {body}
      </p>
    </div>
  );
}

// ── Single match card (unchanged) ──
function MatchCard({ match, isOpen, onToggle, onOpen }) {
  const confidence = match.confidence || 0;
  const pick = derivePick(match);
  const score = match.correct_score || null;
  const isCustom = match.is_custom === true;

  return (
    <article
      className="card"
      onClick={() => onOpen(match.match_id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="match-top">
        <span className="league">
          {isCustom && <span className="custom-tag">Mid league</span>}
          {match.tournament || 'League'}
        </span>
        <span className="time">
          {new Date(match.date).toLocaleString(undefined, {
            weekday: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      <div className="team-row">
        <Crest team={match.home} />
        <span className="team-name">{match.home?.name}</span>
      </div>
      <div className="team-row">
        <Crest team={match.away} />
        <span className="team-name">{match.away?.name}</span>
      </div>

      <div className="pred-strip">
        <div className="pred-left">
          <span className="pred-label">{isCustom ? 'Suggested' : 'Predicted'}</span>
          <span className="pred-pick">{pick}</span>
        </div>

        {score ? (
          <div className="pred-score">
            {String(score)
              .replace('-', '–')
              .split('')
              .map((c, i) => (c === '–' ? <i key={i}>–</i> : c))}
          </div>
        ) : (
          <div className="pred-score" style={{ fontSize: 13, opacity: 0.5 }}>—</div>
        )}

        {!isCustom && (
          <div className="pred-conf">
            {pct(confidence)}%
            <span className="conf-bar">
              <i style={{ width: `${pct(confidence)}%` }} />
            </span>
          </div>
        )}
      </div>

      {!isCustom && (
        <>
          {match.secondary_pick && (
            <div className="secondary-pick">
              <span className="secondary-label">Also consider:</span>
              <span className="secondary-value">
                {match.secondary_pick.label} ({(match.secondary_pick.probability * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          {match.reasons?.length > 0 && (
            <>
              <button
                className={`why-toggle ${isOpen ? 'open' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
              >
                Why this pick ({match.reasons.length})
                <span className="chev">▾</span>
              </button>
              {isOpen && (
                <div className="why" onClick={(e) => e.stopPropagation()}>
                  {match.reasons.map((r, i) => (
                    <div className="reason" data-tone={r.tone} key={i}>
                      <span className="reason-w">{Math.round((r.weight || 0) * 100)}</span>
                      <span className="reason-tag">{r.tag}</span>
                      <p className="reason-title">{r.title}</p>
                      <p className="reason-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </article>
  );
}

// ── League section header + match list ──
function LeagueSection({ league, matches, openSet, toggle, onOpen }) {
  return (
    <section style={{ marginBottom: 22 }}>
      {/* League header card */}
      <div
        style={{
          background: 'linear-gradient(140deg, rgba(200,247,81,0.10), rgba(200,247,81,0.02))',
          border: '1px solid rgba(200,247,81,0.28)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#C8F751', flexShrink: 0,
            boxShadow: '0 0 8px rgba(200,247,81,0.5)',
          }} />
          <span
            style={{
              fontSize: 13.5, fontWeight: 800, color: '#E9EEF6',
              letterSpacing: '-0.01em', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {league}
          </span>
        </div>
        <span
          style={{
            fontSize: 10.5, fontWeight: 800, color: '#C8F751',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Matches inside */}
      {matches.map((m) => (
        <MatchCard
          key={m.match_id}
          match={m}
          isOpen={openSet.has(m.match_id)}
          onToggle={() => toggle(m.match_id)}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

export default function Matches({ onOpenMatch = () => {} }) {
  const [day, setDay] = useState(0);
  const [customDate, setCustomDate] = useState('');
  const [league, setLeague] = useState('All');
  const [leagues, setLeagues] = useState(['All']);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSet, setOpenSet] = useState(new Set());
  const [dailyMsg, setDailyMsg] = useState(null);

  useEffect(() => {
    matchApi.leagues().then(setLeagues).catch(() => {});
  }, []);

  useEffect(() => {
    dailyMessageApi
      .get()
      .then((d) => {
        if (d && d.heading && d.body) setDailyMsg(d);
        else setDailyMsg(null);
      })
      .catch(() => setDailyMsg(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    let targetDate;
    if (customDate) {
      targetDate = customDate;
    } else {
      const d = new Date();
      d.setDate(d.getDate() + day);
      targetDate = d.toISOString().slice(0, 10);
    }

    matchApi
      .analysis({ date: targetDate, league })
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [day, customDate, league]);

  const toggle = (id) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Group matches by league ──
  const groups = useMemo(() => {
    const map = {};
    matches.forEach((m) => {
      const lg = m.tournament || 'Other';
      if (!map[lg]) map[lg] = [];
      map[lg].push(m);
    });
    return Object.entries(map)
      .map(([league, ms]) => ({ league, matches: ms }))
      .sort((a, b) => {
        // Most matches first; ties alphabetical
        if (b.matches.length !== a.matches.length) {
          return b.matches.length - a.matches.length;
        }
        return a.league.localeCompare(b.league);
      });
  }, [matches]);

  // ── Build cards array with ads between groups ──
  const cards = useMemo(() => {
    const items = [];
    groups.forEach((g, idx) => {
      items.push(
        <LeagueSection
          key={g.league}
          league={g.league}
          matches={g.matches}
          openSet={openSet}
          toggle={toggle}
          onOpen={onOpenMatch}
        />
      );

      const isLast = idx === groups.length - 1;
      // Every 2 groups: banner
      if (!isLast && (idx + 1) % 2 === 0) {
        items.push(<BannerAd key={`b-${idx}`} height={250} width={300} />);
      }
      // Every 3 groups: smartlink
      if (!isLast && (idx + 1) % 3 === 0) {
        items.push(<Smartlink key={`s-${idx}`} text="Special Offer" type="adsterra" />);
      }
    });
    return items;
  }, [groups, openSet, onOpenMatch]);

  return (
    <div className="screen">
      {dailyMsg && <DailyMessageCard heading={dailyMsg.heading} body={dailyMsg.body} />}

      <div className="date-custom">
        <label htmlFor="datePicker">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
          Pick a date
        </label>
        <input
          id="datePicker"
          type="date"
          value={customDate}
          min="2024-01-01"
          max="2030-12-31"
          onChange={(e) => { setCustomDate(e.target.value); setOpenSet(new Set()); }}
        />
        {customDate && (
          <button
            className="date-clear"
            onClick={() => { setCustomDate(''); setDay(0); setOpenSet(new Set()); }}
          >
            ✕
          </button>
        )}
      </div>

      {customDate && (
        <div className="date-active-pill">Showing {prettyDate(customDate)}</div>
      )}

      {!customDate && (
        <div className="datestrip">
          {[0, 1, 2, 3, 4, 5, 6].map((off) => {
            const l = dayLabel(off);
            return (
              <button
                key={off}
                className={`date ${day === off ? 'active' : ''}`}
                onClick={() => { setDay(off); setOpenSet(new Set()); }}
              >
                <b>{l.top}</b>
                <span>{l.bot}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="chips">
        {leagues.map((lg) => (
          <button
            key={lg}
            className={`chip ${league === lg ? 'active' : ''}`}
            onClick={() => { setLeague(lg); setOpenSet(new Set()); }}
          >
            {lg}
          </button>
        ))}
      </div>

      {/* Top banner */}
      <BannerAd height={250} width={300} />

      <div className="list">
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            Loading predictions…
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            {customDate
              ? `No predictions for ${prettyDate(customDate)}.`
              : 'No predictions for this filter yet.'}
          </div>
        )}

        {!loading && cards}
      </div>

      {/* Bottom smartlink before social */}
      {!loading && cards.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <Smartlink text="Sponsored" type="monetag" />
        </div>
      )}

      <SocialLinks title="Follow Formline" />

      <div style={{ height: 24 }} />
    </div>
  );
}