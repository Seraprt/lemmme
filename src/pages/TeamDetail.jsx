import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import Smartlink from '../components/Smartlink';
import BannerAd from '../components/BannerAd';
import { teamApi } from '../api';

const pct = (v) => Math.round((v || 0) * 100);

function readHome(v) {
  if (v < 0.4) return { tone: 'bad', label: 'Weak at home', text: 'They give up their home advantage.' };
  if (v < 0.6) return { tone: 'warn', label: 'Average', text: 'A normal home record. No major edge.' };
  if (v < 0.78) return { tone: 'ok', label: 'Strong', text: 'They win most home games and score freely at home.' };
  return { tone: 'good', label: 'Fortress', text: 'A genuine fortress. Very few sides take points here.' };
}

function readAway(v) {
  if (v < 0.3) return { tone: 'bad', label: 'Poor traveller', text: 'Below our 0.30 away line — they rarely get results on the road.' };
  if (v < 0.45) return { tone: 'warn', label: 'Below average', text: 'They travel worse than their league position suggests.' };
  if (v < 0.65) return { tone: 'ok', label: 'Solid', text: 'A dependable away side that picks up points on the road.' };
  return { tone: 'good', label: 'Elite away', text: 'One of the best travelling records in the league.' };
}

function readAttack(v) {
  if (v >= 1.5) return { tone: 'good', label: 'Elite attack', note: 'Scores far above league average — a genuine goal threat.' };
  if (v >= 1.2) return { tone: 'good', label: 'Strong attack', note: 'Above average — regularly creates and converts chances.' };
  if (v >= 0.9) return { tone: 'ok', label: 'Average attack', note: 'Around league average for goals scored.' };
  if (v >= 0.7) return { tone: 'warn', label: 'Weak attack', note: 'Struggles to score — often relies on set pieces.' };
  return { tone: 'bad', label: 'Very weak attack', note: 'Rarely scores — low attacking output across the season.' };
}

function readDefence(v) {
  if (v <= 0.7) return { tone: 'good', label: 'Elite defence', note: 'Concedes far less than league average — hard to break down.' };
  if (v <= 0.9) return { tone: 'good', label: 'Strong defence', note: 'Concedes less than average — a reliable back line.' };
  if (v <= 1.1) return { tone: 'ok', label: 'Average defence', note: 'Concedes roughly league average.' };
  if (v <= 1.3) return { tone: 'warn', label: 'Weak defence', note: 'Leaks goals — concedes above league average.' };
  return { tone: 'bad', label: 'Very weak defence', note: 'Very porous — concedes heavily and often.' };
}

function FormPills({ form }) {
  if (!form || !form.length) return null;
  return (
    <div className="form-row">
      {form.map((r, i) => (
        <span className={`pill ${r}`} key={i}>
          {r}
        </span>
      ))}
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TeamDetail({ teamId, onBack, onCompareWith }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    teamApi
      .details(teamId)
      .then(setTeam)
      .catch(() => setTeam(null))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="screen" style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
        Loading team…
      </div>
    );
  }
  if (!team) {
    return (
      <div className="screen" style={{ padding: 60, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
        Team not found.
      </div>
    );
  }

  const homeRead = readHome(team.home_strength);
  const awayRead = readAway(team.away_strength);
  const attackRead = readAttack(team.attack_rating || 1.0);
  const defenceRead = readDefence(team.defence_rating || 1.0);

  const attackPct = Math.min(100, pct((team.attack_rating || 1.0) / 2.5));
  const defencePct = Math.max(
    0,
    Math.min(100, Math.round(((2.5 - (team.defence_rating || 1.0)) / 2.2) * 100))
  );

  const homePct = pct((team.home_strength || 1.5) / 3);
  const awayPct = pct((team.away_strength || 1.0) / 3);

  return (
    <div className="screen">
      <div style={{ padding: '0 16px 4px' }}>
        <button
          className="chip"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="team-hero">
        <Crest team={team} size="lg" />
        <div>
          <h1>{team.name}</h1>
          <p>{team.league || '—'}</p>
          <FormPills form={team.recent_form} />
        </div>
      </div>

      {team.away_warning && (
        <div className="callout">
          <b>Travel warning.</b> {team.name} have an away strength of{' '}
          {team.away_strength?.toFixed(2)} — below our 0.30 threshold. They're
          significantly weaker on the road than their league position suggests.
        </div>
      )}

      {team.next_match && team.next_match.opponent && (
        <>
          <div className="sec-head">
            <h2>Next match</h2>
            <span>{team.next_match.competition}</span>
          </div>
          <div className="next-match-card">
            <div className="next-match-side">
              <Crest team={team} />
              <span className="next-team-name">
                {team.short || team.name.slice(0, 3)}
              </span>
            </div>
            <div className="next-match-mid">
              <span className="next-vs">VS</span>
              <span className="next-time">{formatDateTime(team.next_match.date)}</span>
              <span className="next-venue">
                {team.next_match.was_home ? 'Home' : 'Away'}
              </span>
            </div>
            <div className="next-match-side">
              <Crest team={team.next_match.opponent} />
              <span className="next-team-name">
                {team.next_match.opponent.short ||
                  team.next_match.opponent.name.slice(0, 3)}
              </span>
            </div>
          </div>
        </>
      )}

      {team.recent_matches?.length > 0 && (
        <>
          <div className="sec-head">
            <h2>Recent results</h2>
            <span>Last {team.recent_matches.length}</span>
          </div>
          <div className="recent-list">
            {team.recent_matches.map((m, i) => (
              <div className="recent-item" key={i}>
                <span className={`recent-pill ${m.result}`}>{m.result}</span>
                <div className="recent-teams">
                  {m.was_home ? (
                    <>
                      <div className="recent-row">
                        <span className="recent-side-label">H</span>
                        <span className="recent-opp">{team.name}</span>
                        <span className="recent-score">{m.goals_for}</span>
                      </div>
                      <div className="recent-row">
                        <span className="recent-side-label">A</span>
                        <span className="recent-opp">{m.opponent?.name}</span>
                        <span className="recent-score">{m.goals_against}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="recent-row">
                        <span className="recent-side-label">H</span>
                        <span className="recent-opp">{m.opponent?.name}</span>
                        <span className="recent-score">{m.goals_against}</span>
                      </div>
                      <div className="recent-row">
                        <span className="recent-side-label">A</span>
                        <span className="recent-opp">{team.name}</span>
                        <span className="recent-score">{m.goals_for}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="recent-meta">
                  <span className="recent-date">{formatDate(m.date)}</span>
                  <span className="recent-comp">
                    {m.competition?.slice(0, 18) || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Adsterra Banner */}
      <BannerAd height={250} width={300} />

      <div className="sec-head">
        <h2>Team strength</h2>
        <span>0 – 100 scale</span>
      </div>

      <div className="meter">
        <div className="meter-top">
          <span className="meter-name">Attack</span>
          <span className="meter-val">
            {pct(team.attack_rating / 2.5)}
            <span className="meter-sub"> ({team.attack_rating.toFixed(2)}× avg)</span>
          </span>
        </div>
        <div className="meter-track">
          <i style={{ width: `${attackPct}%`, background: '#C8F751' }} />
        </div>
        <div className="meter-tags">
          <span className={`tagline ${attackRead.tone}`}>{attackRead.label}</span>
        </div>
        <p className="meter-note">
          Goals scored relative to league average. 1.00× = league average.{' '}
          {attackRead.note}
        </p>
      </div>

      <div className="meter">
        <div className="meter-top">
          <span className="meter-name">Defence</span>
          <span className="meter-val">
            {defencePct}
            <span className="meter-sub"> ({team.defence_rating.toFixed(2)}× avg)</span>
          </span>
        </div>
        <div className="meter-track">
          <i style={{ width: `${defencePct}%`, background: '#5AA9FF' }} />
        </div>
        <div className="meter-tags">
          <span className={`tagline ${defenceRead.tone}`}>{defenceRead.label}</span>
        </div>
        <p className="meter-note">
          Goals conceded relative to league average. Lower ratio = stronger defence.
          The bar is inverted so higher = better. {defenceRead.note}
        </p>
      </div>

      <div className="meter">
        <div className="meter-top">
          <span className="meter-name">Home strength</span>
          <span className="meter-val">{homePct}</span>
          <span className={`tagline ${homeRead.tone}`}>{homeRead.label}</span>
        </div>
        <div className="meter-track">
          <i
            style={{
              width: `${homePct}%`,
              background:
                homeRead.tone === 'bad'
                  ? '#FF6161'
                  : homeRead.tone === 'warn'
                  ? '#FFB020'
                  : '#3ED598',
            }}
          />
        </div>
        <p className="meter-note">{homeRead.text}</p>
      </div>

      <div className="meter" style={{ borderBottom: 0 }}>
        <div className="meter-top">
          <span className="meter-name">Away strength</span>
          <span className="meter-val">{awayPct}</span>
          <span className={`tagline ${awayRead.tone}`}>{awayRead.label}</span>
        </div>
        <div className="meter-track">
          <i
            style={{
              width: `${awayPct}%`,
              background:
                awayRead.tone === 'bad'
                  ? '#FF6161'
                  : awayRead.tone === 'warn'
                  ? '#FFB020'
                  : '#3ED598',
            }}
          />
        </div>
        <p className="meter-note">{awayRead.text}</p>
      </div>

      <Smartlink text="Special Offer" type="adsterra" />

      <div style={{ padding: '20px 16px 28px' }}>
        <button
          className="btn-primary"
          style={{ width: '100%', margin: 0 }}
          onClick={() => onCompareWith(team)}
        >
          Compare {team.short} with another team
        </button>
      </div>
    </div>
  );
}