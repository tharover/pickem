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
            <th>Home</th>
            <th>Away</th>
            <th>Over</th>
            <th>Under</th>
          </tr>
        </thead>
        <tbody>
          {sortedGameIds.map(gameId => {
            const g = games[gameId];
            return (
              <React.Fragment key={`game-${gameId}`}>
                <tr className="desktop-row">
                  <td><strong>{g.away} @ {g.home}</strong></td>
                  <td>{g.homePoints}</td>
                  <td>{g.awayPoints}</td>
                  <td>{g.over}</td>
                  <td>{g.under}</td>
                </tr>
                <tr className="mobile-row mobile-matchup-row detail-row">
                  <td colSpan="5"><strong>{g.away} @ {g.home}</strong></td>
                </tr>
                <tr className="mobile-row detail-row">
                  <td colSpan="5"><strong>Home:</strong> {g.homePoints}</td>
                </tr>
                <tr className="mobile-row detail-row">
                  <td colSpan="5"><strong>Away:</strong> {g.awayPoints}</td>
                </tr>
                <tr className="mobile-row detail-row">
                  <td colSpan="5"><strong>Over:</strong> {g.over}</td>
                </tr>
                <tr className="mobile-row detail-row">
                  <td colSpan="5"><strong>Under:</strong> {g.under}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
