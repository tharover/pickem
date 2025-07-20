import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import TitleBar from './components/TitleBar';
import HomePage from './pages/HomePage';
import PickFormPage from './pages/PickFormPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import StatusPage from './pages/StatusPage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router basename='/pickem'>
      <TitleBar />
      <NavBar />
      <Routes>
        <Route path="/status" element={<StatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/form" element={<ProtectedRoute><PickFormPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;