import React, { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';

export default function Leaderboard() {
  const [meta, setMeta] = useState({ year: '', week: '', updatedAt: '', games: [] });
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch(`${process.env.REACT_APP_LEADERBOARD_URL}?t=${Date.now()}`);
      const json = await res.json();
      setMeta({
        year: json.year,
        week: json.week,
        updatedAt: json.updatedAt,
        games: json.games || []
      });
      setRawData(json.data || []);
    };

    fetchLeaderboard();
  }, []);

  if (!rawData.length) return <p>Loading leaderboard...</p>;

  // 🔢 Group picks by player
  const grouped = rawData.reduce((acc, row) => {
    const email = row.Email || row['Email Address'];
    if (!acc[email]) acc[email] = [];
    acc[email].push(row);
    return acc;
  }, {});

  // 📦 Transform for Pick Table
  const pickRows = Object.entries(grouped).map(([email, picks]) => {
    const sorted = picks.sort((a, b) => a['Game #'] - b['Game #']);
    const total = sorted.reduce((sum, p) => sum + (Number(p.Points) || 0), 0);
    return {
      email,
      week: sorted[0].Week,
      picks: sorted.map(p => ({
        Pick: p.Pick,
        Points: p.Points,
        'Correct Outcome': p['Correct Outcome']
      })),
      total
    };
  });

  const maxGames = Math.max(...Object.values(grouped).map(p => p.length));

  return (
    <div className="leaderboard-container">
      <h3>Pick results: {meta.year}, week {meta.week}</h3>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Week</th>
            {Array.from({ length: maxGames }).flatMap((_, j) => [
              <th key={`game-${j}`}>Game {j + 1}</th>,
              <th key={`points-${j}`}>Points</th>
            ])}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pickRows.map((player, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
              <td>{player.email}</td>
              <td>{player.week}</td>
              {Array.from({ length: maxGames }).flatMap((_, j) => {
                const pick = player.picks[j];
                const isCorrect = pick?.Pick === pick?.['Correct Outcome'];
                return [
                  <td
                    key={`pick-${i}-${j}`}
                    className={isCorrect ? 'leaderboard-correct' : ''}
                  >
                    {pick?.Pick ?? ''}
                  </td>,
                  <td key={`pts-${i}-${j}`}>{pick?.Points ?? ''}</td>
                ];
              })}
              <td><strong>{player.total}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>


      <h3>Game results: {meta.year}, week {meta.week}</h3>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Kickoff</th>
            <th>Matchup</th>
            <th>O/U</th>
            <th>Home Score</th>
            <th>Away Score</th>
          </tr>
        </thead>
        <tbody>
          {meta.games.map((game, i) => {
            const formattedKickoff = new Date(game.Kickoff).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });

            return (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                <td>{i + 1}</td>
                <td>{formattedKickoff}</td>
                <td>{`${game['Away Team']} (${game['Away Spread']}) @ ${game['Home Team']}`}</td>
                <td>{game.OU}</td>
                <td>{game['Home Points']}</td>
                <td>{game['Away Points']}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

