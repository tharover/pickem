import { useState, useEffect, useCallback } from 'react';
import { StorageKeys, storageUtils } from '../../utils/storageUtils';
import { ProxyFunctions, proxyRequest } from '../../utils/proxy';

// *********************************************************************
// Helper function to check if a game is currently in progress
// This checks if the current time is within the game's kickoff time and duration
// *********************************************************************
function isGameInProgress(gameTime) {
  const kickoff = new Date(gameTime).getTime();
  const now = Date.now();
  const GAME_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

  return !isNaN(kickoff) && now >= kickoff && now <= kickoff + GAME_DURATION_MS;
}

// *********************************************************************
// Helper function to check if there are any live games in the leaderboard data
// This checks if any game in the provided object is currently in progress
// *********************************************************************
function hasLiveGames(gamesObj) {
  if (!gamesObj || typeof gamesObj !== "object") return false;

  return Object.values(gamesObj).some(game => isGameInProgress(game.gameTime));
}

// *********************************************************************
// Check if the cached leaderboard is still valid
// This checks if the cached leaderboard has any in-progress games
// If it does, we invalidate the cache after a short period
// *********************************************************************
function shouldInvalidateCache(gamesObj, cacheTimestamp) {
  const now = Date.now();
  const cacheAgeMs = now - Number(cacheTimestamp);
  const MAX_LIVE_CACHE_AGE_MS = 5 * 60 * 1000;     // 5 minutes for live games
  const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;    // 24 hours for regular cache

  // Ensure gamesObj is valid object
  if (!gamesObj || typeof gamesObj !== "object") return true;
  if (Object.keys(gamesObj).length === 0) return true; // No games means cache is invalid

  // Check if any game is currently in progress
  const liveGames = hasLiveGames(gamesObj);

  if (liveGames) {
    return cacheAgeMs > MAX_LIVE_CACHE_AGE_MS;
  } else {
    return cacheAgeMs > MAX_CACHE_AGE_MS;
  }
}

// *********************************************************************
// Load cached leaderboard data if available
// This checks if the cached leaderboard is valid and has no in-progress games
// *********************************************************************
function loadCachedLeaderboard() {
  const cached = storageUtils.get(StorageKeys.LEADERBOARD);
  const timestamp = storageUtils.get(StorageKeys.LEADERBOARD_TIMESTAMP);

  if (!cached || !timestamp) return null;

  try {
    const parsed = JSON.parse(cached);
    const gamesObj = parsed.games;

    if (shouldInvalidateCache(gamesObj, timestamp)) return null;

    return parsed;
  } catch (err) {
    console.warn("❌ Failed to parse cached leaderboard:", err);
    return null;
  }
}


// *********************************************************************
// Cache the leaderboard data to localStorage
// This stores the leaderboard and the current timestamp
// *********************************************************************
const LEADERBOARD_TIMESTAMP_KEY = StorageKeys.LEADERBOARD_TIMESTAMP;
function cacheLeaderboard(data) {
  storageUtils.set(StorageKeys.LEADERBOARD, JSON.stringify(data));
  storageUtils.set(StorageKeys.LEADERBOARD_TIMESTAMP, Date.now().toString());
}

// *********************************************************************
// Custom hook to fetch and manage leaderboard data
// This handles loading, caching, and refreshing leaderboard data
// *********************************************************************
export default function useLeaderboardData({ navigate, setToast }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const loadData = useCallback(async (forceRefresh = false) => {
    const tokenRaw = storageUtils.get(StorageKeys.TOKEN);
    const token = tokenRaw ? JSON.parse(tokenRaw) : null;

    if (!token) {
      console.warn('🔐 No token found — redirecting to login');
      storageUtils.clearAll();
      navigate('/login');
      return;
    }

    setStatus('loading');
    setData(null);

    if (!forceRefresh) {
      const cached = loadCachedLeaderboard();
      console.log('🔍 Checking cached leaderboard:', cached);
      if (cached) {
        console.log('✅ Using cached leaderboard data');
        setData(cached);
        setStatus('success');
        return;
      }
    }

    try {
      const response = await proxyRequest(ProxyFunctions.GET_LEADERBOARD, { token });

      if (response.code === 401) {
        console.warn('🔐 Token invalid — redirecting to login');
        storageUtils.clearAll();
        navigate('/login');
        return;
      }

      if (response.status !== 'success' || response.code !== 200 || !response.data?.games) {
        console.warn('Leaderboard fetch failed:', response);
        setStatus('error');
        return;
      }

      console.log('📡 Fetched fresh leaderboard data:', response);

      setData(response.data);
      setStatus('success');
      setToast({ message: 'Leaderboard loaded successfully', type: 'success' });

      cacheLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setStatus('error');
    }
  }, [navigate, setToast]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setStatus('refreshing');
    await loadData(true);
  };

  return { data, status, refresh };
}

