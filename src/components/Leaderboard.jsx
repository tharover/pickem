import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/pickem-hub/data/leaderboard.json')
      .then(res => res.json())
      .then(json => {
        // Optional: group and summarize by player
        const grouped = summarize(json);
        setData(grouped);
      });
  }, []);

  const summarize = (rows) => {
    const totals = {};
    rows.forEach(row => {
      const key = row['Email'];
      if (!totals[key]) totals[key] = { email: key, points: 0 };
      totals[key].points += Number(row['Points'] || 0);
    });
    return Object.values(totals).sort((a, b) => b.points - a.points);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🏈 Weekly Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, index) => (
            <tr key={player.email}>
              <td>{index + 1}</td>
              <td>{player.email}</td>
              <td>{player.points.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}