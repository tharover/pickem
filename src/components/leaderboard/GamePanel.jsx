import React from 'react';
import { sortGamesByTime } from '../../utils/leaderboardUtils';

export default function GamePanel({ games }) {
  const sortedGameIds = sortGamesByTime(games);

  return (
    <div className="leaderboard-panel">
      <h3>Game Results</h3>
      <table className="leaderboard-table">
        <thead>
          <tr className="desktop-row">
            <th>Matchup</th>
            <th>Score</th>
            <th>Away Pts</th>
            <th>Home Pts</th>
            <th>O/U</th>
          </tr>
        </thead>
        <tbody>
          {sortedGameIds.map(gameId => {
            const g = games[gameId];
            return (
              <React.Fragment key={`game-${gameId}`}>
                <tr className="desktop-row">
                  <td><strong>{g.away} ({g.awaySpread}) @ {g.home} ({g.homeSpread})</strong></td>
                  <td>{g.awayScore} - {g.homeScore}</td>
                  <td>{g.awayPoints}</td>
                  <td>{g.homePoints}</td>
                  <td>{g.over} / {g.under}</td>
                </tr>

                <tr className="mobile-row detail-row">
                  <td colSpan="5">
                    <strong>{g.away} ({g.awaySpread}) @ {g.home} ({g.homeSpread})</strong><br />
                    <strong>Score:</strong> {g.awayScore} - {g.homeScore}<br />
                    <strong>Away Pts:</strong> {g.awayPoints}<br />
                    <strong>Home Pts:</strong> {g.homePoints}<br />
                    <strong>O/U:</strong> {g.over} / {g.under}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
