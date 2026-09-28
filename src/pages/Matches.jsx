import React, { useEffect, useMemo, useState } from 'react';
import { matchApi } from '../api';
import Crest from '../components/Crest';
import { BannerAd, Smartlink } from '../components/AdSlot';

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
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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

function MatchCard({ match, isOpen, onToggle }) {
  const confidence = match.confidence || 0;
  const pick = derivePick(match);
  const score = match.correct_score || null;
  const isCustom = match.is_custom === true;

  return (
    <article className="card">
      <div className="match-top">
        <span className="league">
          {isCustom && <span className="custom-tag">📌 Custom</span>}
          {match.tournament || 'League'}
        </span>
        <span className="time">
          {new Date(match.date).toLocaleString(undefined, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
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
          <span className="pred-label">
            {isCustom ? 'Suggested' : 'Predicted'}
          </span>
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
          <div className="pred-score" style={{ fontSize: 13, opacity: 0.5 }}>
            —
          </div>
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

      {isCustom ? (
        <div className="custom-notice">
          ⚠️{' '}
          {match.custom_notice ||
            'This league is not covered by our main data feed — prediction is a manual market suggestion.'}
        </div>
      ) : (
        <>
          {match.secondary_pick && (
            <div className="secondary-pick">
              <span className="secondary-label">Also consider:</span>
              <span className="secondary-value">
                {match.secondary_pick.label} (
                {(match.secondary_pick.probability * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          {match.reasons?.length > 0 && (
            <>
              <button
                className={`why-toggle ${isOpen ? 'open' : ''}`}
                onClick={onToggle}
              >
                Why this pick ({match.reasons.length})
                <span className="chev">▾</span>
              </button>
              {isOpen && (
                <div className="why">
                  {match.reasons.map((r, i) => (
                    <div className="reason" data-tone={r.tone} key={i}>
                      <span className="reason-w">
                        {Math.round((r.weight || 0) * 100)}
                      </span>
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

export default function Matches() {
  const [day, setDay] = useState(0);
  const [customDate, setCustomDate] = useState('');
  const [league, setLeague] = useState('All');
  const [leagues, setLeagues] = useState(['All']);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSet, setOpenSet] = useState(new Set());

  useEffect(() => {
    matchApi.leagues().then(setLeagues).catch(() => {});
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

  const cards = useMemo(() => {
    return matches.map((m, idx) => {
      const el = (
        <MatchCard
          key={m.match_id}
          match={m}
          isOpen={openSet.has(m.match_id)}
          onToggle={() => toggle(m.match_id)}
        />
      );
      if (idx === 2 || idx === 5) {
        return (
          <React.Fragment key={`wrap-${m.match_id}`}>
            {el}
            <BannerAd height={100} label="Ad" />
          </React.Fragment>
        );
      }
      return el;
    });
  }, [matches, openSet]);

  return (
    <div className="screen">
      <div className="date-custom">
        <label htmlFor="datePicker">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          onChange={(e) => {
            setCustomDate(e.target.value);
            setOpenSet(new Set());
          }}
        />
        {customDate && (
          <button
            className="date-clear"
            onClick={() => {
              setCustomDate('');
              setDay(0);
              setOpenSet(new Set());
            }}
          >
            ✕
          </button>
        )}
      </div>

      {customDate && (
        <div className="date-active-pill">📅 Showing {prettyDate(customDate)}</div>
      )}

      {!customDate && (
        <div className="datestrip">
          {[0, 1, 2, 3, 4, 5, 6].map((off) => {
            const l = dayLabel(off);
            return (
              <button
                key={off}
                className={`date ${day === off ? 'active' : ''}`}
                onClick={() => {
                  setDay(off);
                  setOpenSet(new Set());
                }}
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
            onClick={() => {
              setLeague(lg);
              setOpenSet(new Set());
            }}
          >
            {lg}
          </button>
        ))}
      </div>

      <Smartlink text="Sponsored offer" />

      <div className="list">
        {loading && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--dim)',
              fontSize: 13,
            }}
          >
            Loading predictions…
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              color: 'var(--dim)',
              fontSize: 13,
            }}
          >
            {customDate
              ? `No predictions for ${prettyDate(customDate)}.`
              : 'No predictions for this filter yet.'}
          </div>
        )}

        {!loading && cards}
      </div>

      <BannerAd height={90} label="Banner Ad" />
    </div>
  );
}