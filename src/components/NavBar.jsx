import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ Remove token
    localStorage.removeItem('email'); // ✅ Remove email
    navigate('/login'); // 🔁 Redirect to login
  };

  return (
    <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
      <Link to="/">Home</Link>
      <Link to="/form">Submit Picks</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <button onClick={handleLogout} className="nav-link logout">
        Logout
      </button>
    </nav>
  );
}