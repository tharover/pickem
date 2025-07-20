import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const links = [
    { path: '/', label: 'Home' },
    { path: '/form', label: 'Picks' },
    { path: '/leaderboard', label: 'Leaderboard' }
  ];

  return (
    <nav className="app-nav">
      {links.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`nav-link ${location.pathname === path ? 'active' : ''}`}
        >
          {label}
        </Link>
      ))}
      <button onClick={handleLogout} className="nav-link logout">
        Logout
      </button>
    </nav>
  );
}