import { useState } from 'react';
import PlayerRow from './PlayerRow';

import { calculatePoints } from '../../utils/leaderboardUtils';

export default function PlayerPanel({ leaderboard, games }) {
    const [expandedUser, setExpandedUser] = useState(null);
    const now = new Date();

    if (!Array.isArray(leaderboard)) {
        return <div>Invalid leaderboard data!</div>;
    }
    if (leaderboard.length === 0) {
        return <div>No players found in the leaderboard.</div>;
    }

    // Calculate total points for each player
    const leaderboardWithPoints = leaderboard.map(player => {
        const results = player.picks.map(pick => {
            const game = games[pick.gameId];
            if (!game) return null;
            const points = calculatePoints(pick, game);
            return typeof points === 'number' ? points : 0;
        }).filter(p => typeof p === 'number');
        const totalPoints = results.reduce((sum, pts) => sum + pts, 0);
        return { ...player, totalPoints };
    });

    // Sort by total points descending
    const sortedLeaderboard = leaderboardWithPoints.slice().sort((a, b) => b.totalPoints - a.totalPoints);

    // Place indicators for 1st-4th with tooltip info
    const placeIndicators = [
        { icon: '🥇', tooltip: '1st place: 15 units' },
        { icon: '🥈', tooltip: '2nd place: 10 units' },
        { icon: '🥉', tooltip: '3rd place: 5 units' },
        { icon: '🏅', tooltip: '4th place: 2 units' }
    ];

    return (
        <div className="leaderboard-panel">
            <h3>Player Picks</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Total Points</th>
                        <th>Place</th>
                        <th>▼</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedLeaderboard.map((player, idx) => (
                        <PlayerRow
                            key={`player-${player.email}`}
                            player={player}
                            games={games}
                            now={now}
                            expandedUser={expandedUser}
                            setExpandedUser={setExpandedUser}
                            place={idx < 4 ? placeIndicators[idx] : null}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
