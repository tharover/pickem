import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { StorageKeys, storageUtils } from '../utils/storageUtils';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    storageUtils.clearAll();
    console.log('🔐 User logged out — redirecting to login');
    navigate('/login');
  };

  const links = [
    { path: '/form', label: 'Picks' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/logout', label: 'Logout' }
  ];

  return (
    <nav className="app-nav">
      <div className="nav-links">
        {links.map(({ path, label }) =>
          path === '/logout' ? (
            <button key={path} onClick={handleLogout} className="nav-link logout-link">
              {label}
            </button>
          ) : (
            <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`}>
              {label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
