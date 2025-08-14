import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PickForm from '../components/PickForm';
import Toast from '../components/Toast';
import { StorageKeys, storageUtils } from '../utils/storageUtils';
import { ProxyFunctions, proxyRequest } from '../utils/proxy';

const PickFormPage = () => {
  const [games, setGames] = useState([]);
  const [year, setYear] = useState(storageUtils.get(StorageKeys.YEAR) || null);
  const [week, setWeek] = useState(storageUtils.get(StorageKeys.WEEK) || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  const navigate = useNavigate();

  // ***********************************************************************
  // Cache game data for 15 minutes
  // ***********************************************************************
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);

      // Clear storage and redirect if no token or email
      const email = storageUtils.get(StorageKeys.EMAIL);
      const token = storageUtils.get(StorageKeys.TOKEN);
      if (!token || !email) {
        console.warn('🔐 No token or email found — redirecting to login');
        setLoading(false);
        storageUtils.clearAll();
        navigate('/login');
        return;
      }

      // If year or week are not available in localStorage, force a refresh
      const year = storageUtils.get(StorageKeys.YEAR);
      const week = storageUtils.get(StorageKeys.WEEK);
      if (!year || !week) {
        console.log('Year or week not available, forcing refresh');
        storageUtils.remove(StorageKeys.GAMES); // Clear cache
      }

      // Use games from localStorage if available
      const cached = storageUtils.get(StorageKeys.GAMES);
      if (cached) {
        const { games, timestamp } = JSON.parse(cached);
        const now = Date.now();
        // If cached data is less than 1 hour old, use it
        if (now - timestamp < 60 * 60 * 1000) {
          console.log('Using cached game data');
          setGames(games || []);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh game data if we make it here
      console.log('Fetching fresh game data');
      const response = await proxyRequest(
        ProxyFunctions.GET_SELECTED_GAMES,
        { email: storageUtils.get(StorageKeys.EMAIL), token: storageUtils.get(StorageKeys.TOKEN) }
      );

      // If response is 401, clear storage and redirect
      if (response.code === 401) {
        console.warn('🔐 Token invalid — redirecting to login');
        storageUtils.clearAll();
        navigate('/login');
        return;
      }

      // Check if data is valid and response contains games and status is 'success' and code is 200
      if (!response || !response.data?.games || response.status !== 'success' || response.code !== 200) {
        console.error('Failed to fetch game data:', response);
        setToast({ message: "Could not load game data.", type: 'error' });
        setLoading(false);
        return;
      }

      // Set games, year, and week from fetched data
      console.log('Loaded games, year, and week:', response);
      setGames(response.data?.games || []);
      setYear(response.year || null);
      setWeek(response.week || null);
      storageUtils.set(StorageKeys.GAMES, JSON.stringify({ games: response.data?.games, timestamp: Date.now() }));
      setLoading(false);
    };

    loadGames();
  }, []);


  //************************************************************************
  // Render the pick form or loading/error state
  //************************************************************************
  return (
    <div className="component-wrapper">
      {loading && <p>⏳ Loading pick'em form...</p>}
      {!loading && <PickForm games={games} setGames={setGames} year={year} setYear={setYear} week={week} setWeek={setWeek} />}
    </div>
  );
};

export default PickFormPage;