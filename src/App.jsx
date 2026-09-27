import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Compare from './pages/Compare';
import Search from './pages/Search';
import TeamDetail from './pages/TeamDetail';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [screen, setScreen] = useState('matches');
  const [openTeamId, setOpenTeamId] = useState(null);
  const [comparePrefill, setComparePrefill] = useState(null); // set when jumping from team detail

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  function go(target) {
    setScreen(target);
    if (target !== 'team') setOpenTeamId(null);
  }

  function openTeam(id) {
    setOpenTeamId(id);
    setScreen('team');
  }

  function handleCompareWith(team) {
    setComparePrefill(team);
    setScreen('compare');
    setOpenTeamId(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <rect x="1" y="1" width="46" height="46" rx="13" fill="#11151C" stroke="#2A323E" strokeWidth="1.5" />
            <path d="M11 33 L20 23.5 L26.5 28 L37 14" stroke="#C8F751" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="37" cy="14" r="4" fill="#C8F751" />
            <circle cx="11" cy="33" r="3" fill="#5AA9FF" />
          </svg>
          <span className="wordmark">
            FORM<em>LINE</em>
          </span>
        </div>
        <button className="avatar" onClick={logout} title="Sign out">
          {user.username?.slice(0, 2).toUpperCase()}
        </button>
      </header>

      <main className="main">
        {screen === 'matches' && <Matches />}
        {screen === 'compare' && (
          <Compare prefill={comparePrefill} clearPrefill={() => setComparePrefill(null)} />
        )}
        {screen === 'search' && <Search onOpenTeam={openTeam} />}
        {screen === 'team' && (
          <TeamDetail
            teamId={openTeamId}
            onBack={() => go('search')}
            onCompareWith={handleCompareWith}
          />
        )}
      </main>

      <nav className="tabbar">
        <button
          className={`tab ${screen === 'matches' ? 'active' : ''}`}
          onClick={() => go('matches')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
          Matches
        </button>
        <button
          className={`tab ${screen === 'compare' ? 'active' : ''}`}
          onClick={() => go('compare')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
          Compare
        </button>
        <button
          className={`tab ${screen === 'search' || screen === 'team' ? 'active' : ''}`}
          onClick={() => go('search')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Teams
        </button>
      </nav>
    </div>
  );
}