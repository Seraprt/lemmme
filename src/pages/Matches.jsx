import React, { useEffect, useMemo, useState } from 'react';
import { matchApi } from '../api';
import Crest from '../components/Crest';
import { BannerAd, Smartlink } from '../components/AdSlot';

// ─── Helpers ─────────────────────────────────────
const pct = (v) => Math.round((v || 0) * 100);

function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const bot = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  if (offset === 0) return { top: 'Today', bot };
  if (offset === 1) return { top: 'Tmrw', bot };
  return { top: d.toLocaleDateString('en-GB', { weekday: 'short' }), bot };
}

function pickLabel(bestMarket, homeWin, awayWin, draw) {
  if (bestMarket) {
    const map = {
      home_win: 'Home win',
      away_win: 'Away win',
      draw: 'Draw',
      '1X': 'Home or Draw',
      'X2': 'Draw or Away',
      '12': 'Home or Away',
      btts_yes: 'BTTS – Yes',
      btts_no: 'BTTS – No',
      over_1_5: 'Over 1.5',
      over_2_5: 'Over 2.5',
      under_2_5: 'Under 2.5',
      under_3_5: 'Under 3.5',
    };
    return map[bestMarket] || bestMarket.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // Derive from probs
  const max = Math.max(homeWin || 0, draw || 0, awayWin || 0);
  if (max === homeWin) return 'Home win';
  if (max === awayWin) return 'Away win';
  return 'Draw';
}

// ─── Card ────────────────────────────────────────
function MatchCard({ match, isOpen, onToggle }) {
  const homeWin = match.home_win_prob || 0;
  const drawProb = match.draw_prob || 0;
  const awayWin = match.away_win_prob || 0;
  const confidence = match.confidence || 0;
  const pick = pickLabel(match.best_market, homeWin, awayWin, drawProb);
  const score = match.correct_score || '—';

  return (
    <article className="card">
      <div className="match-top">
        <span className="league">{match.tournament || 'League'}</span>
        <span className="time">
          {new Date(match.date).toLocaleString('en-GB', {
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
          <span className="pred-label">Predicted</span>
          <span className="pred-pick">{pick}</span>
        </div>
        <div className="pred-score">
          {String(score).replace('-', '–').split('').map((c, i) =>
            c === '–' ? <i key={i}>–</i> : c
          )}
        </div>
        <div className="pred-conf">
          {pct(confidence)}%
          <span className="conf-bar">
            <i style={{ width: `${pct(confidence)}%` }} />
          </span>
        </div>
      </div>

      {match.markets?.length > 0 && (
        <div className="markets">
          {match.markets.map((m, i) => (
            <span className="mkt" key={i}>
              {m.key} <b>{m.value}</b>
            </span>
          ))}
        </div>
      )}

      {match.reasons?.length > 0 && (
        <>
          <button className={`why-toggle ${isOpen ? 'open' : ''}`} onClick={onToggle}>
            Why this pick ({match.reasons.length})
            <span className="chev">▾</span>
          </button>
          {isOpen && (
            <div className="why">
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
    </article>
  );
}

// ─── Page ────────────────────────────────────────
export default function Matches() {
  const [day, setDay] = useState(0);
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
    const d = new Date();
    d.setDate(d.getDate() + day);
    const date = d.toISOString().slice(0, 10);

    matchApi
      .analysis({ date, league })
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [day, league]);

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
      // Insert an ad after the 2nd and 5th card
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
      {/* Date strip */}
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

      {/* League chips */}
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

      {/* Smartlink ad at top */}
      <Smartlink text="Sponsored offer" />

      {/* Cards */}
      <div className="list">
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            Loading predictions…
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
            No predictions for this filter yet.
          </div>
        )}

        {!loading && cards}
      </div>

      {/* Bottom banner ad */}
      <BannerAd height={90} label="Banner Ad" />
    </div>
  );
}