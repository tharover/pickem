import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import TitleBar from './components/TitleBar';
import HomePage from './pages/HomePage';
import PickFormPage from './pages/PickFormPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <Router basename='/pickem'>
      <TitleBar />
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<PickFormPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;