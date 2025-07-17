import React, { useEffect, useState } from 'react';
import PickForm from '../components/PickForm';
import { PROXY_URL } from '../config';

const PickFormPage = () => {
  const [games, setGames] = useState([]);
  const [year, setYear] = useState([]);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${PROXY_URL}?func=getSelectedGames`);
        const json = await res.json();
        setGames(json.data?.games || []);
        setYear(json.data?.year || null);
        setWeek(json.data?.week || null);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Could not load game data.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      {loading && <p>⏳ Loading pick'em form...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <PickForm games={games}  year={year} week={week}/>}
    </div>
  );
};

export default PickFormPage;