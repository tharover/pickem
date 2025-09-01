import React from 'react';
import { calculatePoints } from '../../utils/leaderboardUtils';
import { StorageKeys, storageUtils } from '../../utils/storageUtils';

export default function PlayerRow({ player, games, now, expandedUser, setExpandedUser, place }) {
  const isExpanded = expandedUser === player.email;

  const results = player.picks.map(pick => {
    const game = games[pick.gameId];
    if (!game) return null;

    const points = calculatePoints(pick, game);
    return {
      gameId: pick.gameId,
      matchup: `${game.away} @ ${game.home}`,
      pick: pick.pick,
      points,
      gameTime: game.gameTime
    };
  }).filter(Boolean);
  console.log(`Results for ${player.email}:`, results);

  const totalPoints = results.reduce((sum, r) => sum + (typeof r.points === 'number' ? r.points : 0), 0);
  const hasMissingPick = player.picks.some(p => p.pick === 'NO PICK');

  return (
    <React.Fragment>
      <tr
        className={`user-row ${hasMissingPick ? 'missing-pick' : ''}`}
        onClick={() => setExpandedUser(isExpanded ? null : player.email)}
        style={{ cursor: 'pointer' }}
      >
        <td>{player.first} {hasMissingPick && <span title="Missing pick!" style={{ float: 'right' }}>⚠️</span>}</td>
        <td>{totalPoints}</td>
        <td>
          {place ? (
            <span title={place.tooltip}>{place.icon}</span>
          ) : ''}
        </td>
        <td>{isExpanded ? '▲' : '▼'}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan="4" style={{ padding: 0 }}>
            <div className="pick-details-wrapper open">
              <table className="inner-pick-table" cellSpacing="0" cellPadding="0" border={0} borderSpacing="0">
                <tbody>
                  {results.length > 0 ? results.map(r => {
                    const gameTime = new Date(r.gameTime);
                    const hasStarted = gameTime <= now;
                    const isLoggedIn = player.email === storageUtils.get(StorageKeys.EMAIL);
                    const isNoPick = r.pick === 'NO PICK';
                    console.log(`User is ${isLoggedIn ? 'logged in' : 'not logged in'}`);
                    const pickDisplay = (hasStarted || isLoggedIn || isNoPick) ? `${r.pick} (${r.points} pts)` : '🔒 Kickoff';
                    return (
                      <React.Fragment key={`result-${player.email}-${r.gameId}`}>
                        <tr className="desktop-row detail-row">
                          <td>{r.matchup}</td>
                          <td>{r.points}</td>
                          <td>{pickDisplay}</td>
                        </tr>
                        <tr className="mobile-row mobile-matchup-row detail-row">
                          <td colSpan="3"><strong>{r.matchup}</strong></td>
                        </tr>
                        <tr className="mobile-row detail-row">
                          <td colSpan="3"><strong>Points: </strong> {r.points}</td>
                        </tr>
                        <tr className="mobile-row detail-row">
                          <td colSpan="3"><strong>Pick: </strong> {pickDisplay}</td>
                        </tr>
                      </React.Fragment>
                    );
                  }) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        No picks submitted for this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
