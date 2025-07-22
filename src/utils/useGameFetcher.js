import { PROXY_URL } from '../config';

//************************************************************************
// Fetch game data with caching
//************************************************************************
export async function fetchGameData(forceRefresh = false) {
  const cacheKey = 'pickem_games';
  const now = Date.now();

  // Attempt cached data
  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < 15 * 60 * 1000) {
        console.log('Used cached game data, timestamp:', new Date(timestamp).toLocaleTimeString());
        return data;
      }
    }
  }

  // Fetch fresh data
  try {
    const email = localStorage.getItem('email');
    const res = await fetch(`${PROXY_URL}?func=getSelectedGames&email=${email}`);
    const json = await res.json();

    const data = {
      games: json.data?.games || [],
      year: json.data?.year || null,
      week: json.data?.week || null
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    console.log('Fetched new game data, timestamp:', new Date(now).toLocaleTimeString());

    return data;
  } catch (err) {
    console.error('Could not load game data:', err);
    return null;
  }
}

//************************************************************************
// Fetch leaderboard data with caching
//************************************************************************
export async function fetchLeaderboardData(forceRefresh = false) {
  const cacheKey = 'pickem_leaderboard';
  const now = Date.now();

  // Attempt cached data
  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < 15 * 60 * 1000) {
        console.log('Used cached game data, timestamp:', new Date(timestamp).toLocaleTimeString());
        return data;
      }
    }
  }

  // Fetch fresh data
  try {
    const res = await fetch(`${PROXY_URL}?func=getLeaderboard`);
    const json = await res.json();

    //localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    console.log('Fetched leaderboard data, timestamp:', new Date(now).toLocaleTimeString());
    console.log('Leaderboard data:', json);

    return json;
  } catch (err) {
    console.error('Could not load game data:', err);
    return null;
  }
}
