const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Small fetch wrapper that always sends the JWT if present.
 */
export async function api(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = localStorage.getItem('formline_token');
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ───── Auth ─────
export const authApi = {
  signup: (payload) => api('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => api('/auth/login', { method: 'POST', body: payload, auth: false }),
  googleLogin: (idToken) =>
    api('/auth/google-login', { method: 'POST', body: { idToken }, auth: false }),
  me: () => api('/auth/me'),
};

// ───── Teams ─────
export const teamApi = {
  search: (q) => api(`/teams/search?q=${encodeURIComponent(q)}`),
  details: (id) => api(`/teams/${id}`),
};

// ───── Matches ─────
export const matchApi = {
  analysis: ({ days = 7, league, date } = {}) => {
    const params = new URLSearchParams();
    if (days) params.set('days', days);
    if (league && league !== 'All') params.set('league', league);
    if (date) params.set('date', date);
    return api(`/matches/analysis?${params.toString()}`);
  },
  leagues: () => api('/matches/leagues'),
};

// ───── Predictions ─────
export const predictionApi = {
  compare: (homeId, awayId) =>
    api(`/predictions/compare?home_id=${homeId}&away_id=${awayId}`),
};