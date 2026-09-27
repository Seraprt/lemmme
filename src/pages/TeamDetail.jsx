import React, { useEffect, useState } from 'react';
import Crest from '../components/Crest';
import { teamApi } from '../api';
import { BannerAd, Smartlink } from '../components/AdSlot';

const pct = (v) => Math.round((v || 0) * 100);

function readHome(v) {
  if (v < 0.40) return { tone: 'bad', label: 'Weak at home', text: 'They give up their home advantage.' };
  if (v < 0.60) return { tone: 'warn', label: 'Average', text: 'A normal home record. No major edge.' };
  if (v < 0.78) return { tone: 'ok', label: 'Strong', text: 'They win most home games and score freely at home.' };
  return { tone: 'good', label: 'Fortress', text: 'A genuine fortress. Very few sides take points here.' };
}
function readAway(v) {
  if (v < 0.30) return { tone: 'bad', label: 'Poor traveller', text: 'Below our 0.30 away line — they rarely get results on the road.' };
  if (v < 0.45) return { tone: 'warn', label: 'Below average', text: 'They travel worse than their league position suggests.' };
  if (v < 0.65) return { tone: 'ok', label: 'Solid', text: 'A dependable away side that picks up points on the road.' };
  return { tone: 'good', label: 'Elite away', text: 'One of the best travelling records in the league.' };
}

function FormPills({ form }) {
  if (!form || !form.length) return null;
  return (
    <div className="form-row">
      {form.map((r, i) => (
        <span className={`pill ${r}`} key={i}>{r}</span>
      ))}
    </div>
  );
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
  const attackPct = pct(team.attack_rating / 2.5);
  const defencePct = pct(team.defence_rating / 2.5);
  const homePct = pct(team.home_strength / 3);
  const awayPct = pct(team.away_strength / 3);

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

      <div className="sec-head">
        <h2>Team strength</h2>
        <span>0 – 100 scale</span>
      </div>

      <div className="meter">
        <div className="meter-top">
          <span className="meter-name">Attack</span>
          <span className="meter-val">{attackPct}</span>
        </div>
        <div className="meter-track">
          <i style={{ width: `${attackPct}%`, background: '#C8F751' }} />
        </div>
        <p className="meter-note">
          How dangerous they are going forward — chance creation and conversion combined.
        </p>
      </div>

      <div className="meter">
        <div className="meter-top">
          <span className="meter-name">Defence</span>
          <span className="meter-val">{defencePct}</span>
        </div>
        <div className="meter-track">
          <i style={{ width: `${defencePct}%`, background: '#5AA9FF' }} />
        </div>
        <p className="meter-note">
          How well they stop the opposition — higher means they concede fewer quality chances.
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

      <Smartlink text="Sponsored offer" />
      <BannerAd height={90} label="Banner Ad" />

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