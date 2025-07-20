import React, { useEffect, useState } from 'react';
import { fetchGameData } from '../utils/useGameFetcher';
import PickForm from '../components/PickForm';
import Toast from '../components/Toast';

const PickFormPage = () => {
  const [games, setGames] = useState([]);
  const [year, setYear] = useState([]);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });


  // ***********************************************************************
  // Cache game data for 15 minutes
  // ***********************************************************************
  useEffect(() => {
  const loadGames = async () => {
    setLoading(true);
    setError(false);
    const data = await fetchGameData();
    if (data) {
      setGames(data.games || []);
      setYear(data.year || null);
      setWeek(data.week || null);
    } else {
      setToast({message:"Could not load game data.", type: 'error'});
      setError(false);
    }
    setLoading(false);
  };

  loadGames();
}, []);


  //************************************************************************
  // Render the pick form or loading/error state
  //************************************************************************
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      {loading && <p>⏳ Loading pick'em form...</p>}
      {!loading && !error && <PickForm games={games} setGames={setGames} year={year} setYear={setYear} week={week} setWeek={setWeek}/>}
    </div>
  );
};

export default PickFormPage;