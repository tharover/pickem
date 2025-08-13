export default function LeaderboardHeader({ year, week, status, onRefresh }) {
  return (
    <div className="leaderboard-header">
      <h2>🏆 Leaderboard{week ? `: ${year}, Week ${week}` : ''}</h2>

      <div className="refresh-button-wrapper">
        <button
          onClick={onRefresh}
          className="refresh-button"
          disabled={status === 'refreshing'}
        >
          {status === 'refreshing' ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
