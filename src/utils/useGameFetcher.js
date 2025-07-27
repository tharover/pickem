import { PROXY_URL } from '../config';
import { StorageKeys, storageUtils } from '../utils/storageUtils';

//************************************************************************
// Fetch game data with caching
//************************************************************************
export async function fetchGameData(forceRefresh = false) {
  const now = Date.now();

  // Attempt cached data
  if (!forceRefresh) {
    const cached = storageUtils.get(StorageKeys.GAMES);
    if (cached) {
      const { games, timestamp } = JSON.parse(cached);
      console.log('Cached game data:', games);
      console.log('Cached timestamp:', new Date(timestamp).toLocaleTimeString());
      if (now - timestamp < 15 * 60 * 1000) {
        console.log('Used cached game data, timestamp:', new Date(timestamp).toLocaleTimeString());
        return games;
      }
    }
  }

  // Fetch fresh data
  try {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    if (!email || !token) {
      console.error('No email or token found in localStorage');
      return null;
    }
    const res = await fetch(`${PROXY_URL}?func=getSelectedGames&email=${email}&token=${token}`);
    const json = await res.json();

    const data = {
      games: json.data?.games || [],
      year: json.data?.year || null,
      week: json.data?.week || null
    };

    storageUtils.set(StorageKeys.GAMES, JSON.stringify({ data, timestamp: now }));
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
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    const res = await fetch(`${PROXY_URL}?func=getLeaderboard&token=${localStorage.getItem('token')}`);
    const json = await res.json();
    console.log('Leaderboard data(' + new Date(now).toLocaleTimeString() + '):', json);

    //localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));

    return json;
  } catch (err) {
    console.error('Could not load game data:', err);
    return null;
  }
}
