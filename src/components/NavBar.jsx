import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1rem 0' }}>
      <Link to="/">Home</Link>
      <Link to="/form">Submit Picks</Link>
      <Link to="/leaderboard">Leaderboard</Link>
    </nav>
  );
}