import { useState, useEffect } from 'react';
import { fetchLeaderboardData } from '../utils/useGameFetcher';
import Toast from '../components/Toast';
import '../styles/Leaderboard.css';

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await fetchLeaderboardData(); // fetches from getLeaderboard(e)
    setData(result.data.responses);
  };

  const refresh = async () => {
    setRefreshing(true);
    localStorage.removeItem('leaderboard'); // optional cache bust
    await loadData();
    setRefreshing(false);
  };

  // 🏆 If no data, show loading skeleton
  if (!data) {
    return (
      <div className="leaderboard-wrapper">
        <h2>🏆 Leaderboard: Week ...</h2>
        <div className="loading-skeleton">
          <div className="skeleton-heading" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-button" />
        </div>
      </div>
    );
  }

  // 🏆 Extract picks and games from data
  const { picks, games } = data;

  // 🧭 Sort games by kickoff time for consistent order
  const sortedGameIds = Object.keys(games).sort((a, b) => {
    const aTime = new Date(games[a].gameTime);
    const bTime = new Date(games[b].gameTime);
    return aTime - bTime;
  });

  // 💯 Build user summaries with points
  const userSummaries = Object.entries(picks)
    .map(([email, pickArray]) => {
      let totalPoints = 0;

      const results = sortedGameIds
        .map(gameId => {
          const game = games[gameId];
          const pick = pickArray.find(p => p.gameId === parseInt(gameId));
          if (!pick) return null;

          const points =
            pick.pick === 'Home' ? game.homePoints :
              pick.pick === 'Away' ? game.awayPoints :
                pick.pick === 'Over' ? game.over :
                  pick.pick === 'Under' ? game.under :
                    0;

          totalPoints += points || 0;

          return {
            gameId,
            matchup: `${game.away} @ ${game.home}`,
            pick: pick.pick,
            points
          };
        })
        .filter(r => r !== null);

      return { email, totalPoints, results };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // 🥇 Assign ranks with tie logic
  function assignRanks(sortedUsers) {
    let rank = 1;
    let previousPoints = null;
    let rankCount = 0;
    const ranked = [];

    for (let i = 0; i < sortedUsers.length; i++) {
      const user = sortedUsers[i];

      if (user.totalPoints !== previousPoints) {
        rank += rankCount;
        rankCount = 1;
        previousPoints = user.totalPoints;
      } else {
        rankCount++;
      }

      const medal =
        rank === 1 ? '🥇' :
          rank === 2 ? '🥈' :
            rank === 3 ? '🥉' : '';

      ranked.push({ ...user, rank, medal });
    }

    return ranked;
  }

  const rankedUsers = assignRanks(userSummaries);

  // 📊 Game summary (also in sorted order)
  const gameSummaries = sortedGameIds.map(gameId => {
    const g = games[gameId];
    return {
      gameId,
      matchup: `${g.away} @ ${g.home}`,
      home: g.homePoints || 0,
      away: g.awayPoints || 0,
      over: g.over || 0,
      under: g.under || 0
    };
  });

  // *********************************************************************
  // 🗂️ Render leaderboard with player picks and game results
  // *********************************************************************
  return (
    <div className="leaderboard-wrapper">
      <h2>🏆 Leaderboard: Week {data.week}</h2>

      {/* 👥 Player Panel */}
      <div className="leaderboard-panel">
        <h3>Player Picks</h3>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Total Points</th>
              <th>▼</th> {/* for expansion icon or empty spacer */}
            </tr>
          </thead>
          <tbody>
            {rankedUsers.map(user => (
              <>
                <tr
                  key={`user-${user.email}`}
                  className="user-row"
                  onClick={() => setExpandedUser(expandedUser === user.email ? null : user.email)}
                >
                  <td>
                    {user.medal && <span>{user.medal} </span>}
                    {user.email}
                  </td>
                  <td>{user.totalPoints}</td>
                  <td>{expandedUser === user.email ? '▲' : '▼'}</td>
                </tr>

                {expandedUser === user.email &&
                  user.results.map((r, i) => (
                    <>
                      {/* 🌐 Desktop view */}
                      <tr key={`desktop-${user.email}-${i}`} className="desktop-row detail-row">
                        <td>{r.matchup}</td>
                        <td>{r.points}</td>
                        <td>{r.pick}</td>
                      </tr>

                      {/* 📱 Mobile stacked view */}
                      <tr key={`mobile1-${user.email}-${i}`} className="mobile-row mobile-matchup-row detail-row">
                        <td colSpan="3"><strong>{r.matchup}</strong></td>
                      </tr>
                      <tr key={`mobile3-${user.email}-${i}`} className="mobile-row detail-row">
                        <td colSpan="3"><strong>Pick: </strong> {r.pick} ({r.points} points)</td>
                      </tr>
                    </>
                  ))}
              </>
            ))}
          </tbody>
        </table>

      </div>

      {/* 🏈 Game Panel */}
      <div className="leaderboard-panel">
        <h3>Game Results</h3>
        <table className="leaderboard-table">
          <thead>
            <tr className="desktop-row">
              <th>Matchup</th>
              <th>Home</th>
              <th>Away</th>
              <th>Over</th>
              <th>Under</th>
            </tr>
          </thead>
          <tbody>
            {gameSummaries.map(g => (
              <>
                {/* 🌐 Desktop View */}
                <tr key={`game-${g.gameId}`} className="desktop-row">
                  <td><strong>{g.matchup}</strong></td>
                  <td>{g.home}</td>
                  <td>{g.away}</td>
                  <td>{g.over}</td>
                  <td>{g.under}</td>
                </tr>

                {/* 📱 Mobile View */}
                <tr key={`game-mobile1-${g.gameId}`} className="mobile-row mobile-matchup-row detail-row">
                  <td colSpan="5"><strong> {g.matchup}</strong></td>
                </tr>
                <tr key={`game-mobile2-${g.gameId}`} className="mobile-row detail-row">
                  <td colSpan="5"><strong>Home:</strong> {g.home} points</td>
                </tr>
                <tr key={`game-mobile3-${g.gameId}`} className="mobile-row detail-row">
                  <td colSpan="5"><strong>Away:</strong> {g.away} points</td>
                </tr>
                <tr key={`game-mobile4-${g.gameId}`} className="mobile-row detail-row">
                  <td colSpan="5"><strong>Over:</strong> {g.over} points</td>
                </tr>
                <tr key={`game-mobile5-${g.gameId}`} className="mobile-row detail-row">
                  <td colSpan="5"><strong>Under:</strong> {g.under} points</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔄 Refresh Button */}
      <div className="refresh-button-wrapper">
        <button onClick={refresh} className="refresh-button" disabled={refreshing}>
          {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Leaderboard'}
        </button>
      </div>
    </div>
  );
}
