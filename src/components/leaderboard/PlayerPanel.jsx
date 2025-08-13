import { useState } from 'react';
import PlayerRow from './PlayerRow';

export default function PlayerPanel({ leaderboard, games }) {
    const [expandedUser, setExpandedUser] = useState(null);
    const now = new Date();

    if (!Array.isArray(leaderboard)) {
        return <div>Invalid leaderboard data!</div>;
    }
    if (leaderboard.length === 0) {
        return <div>No players found in the leaderboard.</div>;
    }
        
    return (
        <div className="leaderboard-panel">
            <h3>Player Picks</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Total Points</th>
                        <th>▼</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map(player => (
                        <PlayerRow
                            key={`player-${player.email}`}
                            player={player}
                            games={games}
                            now={now}
                            expandedUser={expandedUser}
                            setExpandedUser={setExpandedUser}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
