import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const links = [
    { path: '/', label: 'Home' },
    { path: '/form', label: 'Picks' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/logout', label: 'Logout' }
  ];

  return (
    <nav className="app-nav">
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map(({ path, label }) =>
          path === '/logout' ? (
            <button
              key={path}
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="nav-link logout-link"
            >
              {label}
            </button>
          ) : (
            <Link
              key={path}
              to={path}
              className={`nav-link ${
                location.pathname === path ? 'active' : ''
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
