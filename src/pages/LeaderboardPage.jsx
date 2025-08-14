import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerPanel from '../components/leaderboard/PlayerPanel';
import GamePanel from '../components/leaderboard/GamePanel';
import useLeaderboardData from '../components/leaderboard/useLeaderboardData';
import Toast from '../components/Toast'; // Assuming you have this component
import StickyFooter from '../components/StickyFooter';
import '../styles/Leaderboard.css';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '' });

  const { data, status, refresh } = useLeaderboardData({ navigate, setToast });

  const clearToast = () => setToast({ message: '', type: '' });

  return (
    <div className="leaderboard-wrapper">
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <div className="leaderboard-header">
        <h2>🏆 Leaderboard{data?.year && data?.week ? `: ${data?.year}, Week ${data?.week}` : ''}</h2>
      </div>

      {status === 'loading' || status === 'refreshing' ? (
        <div className="loading-skeleton">
          <div className="skeleton-heading" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-button" />
        </div>
      ) : status === 'error' ? (
        <p className="leaderboard-error">
          ⚠️ Leaderboard not currently available. Please try again later.
        </p>
      ) : (
        <>
          <PlayerPanel
            leaderboard={data.leaderboard}
            games={data.games}
            setToast={setToast}
          />
          <GamePanel
            games={data.games}
          />
          <StickyFooter>
              <button
                onClick={refresh}
                className="refresh-button"
                disabled={status === 'refreshing'}
              >
                {status === 'refreshing' ? 'Refreshing...' : 'Refresh'}
              </button>
          </StickyFooter>
        </>
      )}
    </div>
  );
}
