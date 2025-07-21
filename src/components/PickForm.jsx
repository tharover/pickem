import React, { useState, useEffect } from 'react';
import { fetchGameData } from '../utils/useGameFetcher';
import Toast from '../components/Toast';
import { PROXY_URL } from '../config';
import '../styles/PickForm.css';

const PickForm = ({ games, setGames, year, setYear, week, setWeek }) => {
    const [submitStatus, setSubmitStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentPicks, setCurrentPicks] = useState({});
    const [toast, setToast] = useState({ message: '', type: '' });
    const allGamesLocked = games.length > 0 && games.every(game => new Date() > new Date(game.gameTime));

    useEffect(() => {
        const initial = {};
        games.forEach(game => {
            if (game.userPick) {
                initial[game.gameId] = game.userPick;
            }
        });
        setCurrentPicks(initial);
    }, [games]);


    // ***********************************************************************
    // Handle clearing form
    // ***********************************************************************
    const handleClear = () => {
        const form = document.querySelector('.form-container');
        if (!form) return;

        // Reset visible inputs
        form.reset();

        // Manually clear radio buttons (in case .reset() misses anything)
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => (radio.checked = false));

        // Optionally clear status text or other local states
        setSubmitStatus('');

        // Show toast notification
        setToast({ message: 'Your picks were cleared.', type: 'success' });
    };

    // ***********************************************************************
    // Handle form submission
    // ***********************************************************************
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.target);
        setSubmitStatus('📤 Submitting your picks...');

        let hasMissingPick = false;

        for (let i = 0; i < games.length; i++) {
            const isLocked = new Date() > new Date(games[i].gameTime);
            const picked = formData.get(`game-${i}`);
            if (!isLocked && !picked) {
                hasMissingPick = true;
                break;
            }
        }

        if (hasMissingPick) {
            setToast({ message: '❌ Please make a pick for all unlocked games!', type: 'error' });
            setSubmitStatus('❌ Please make a pick for all unlocked games!');
            setSubmitting(false);
            return;
        }

        const picks = games.map((game, index) => {
            const isLocked = new Date() > new Date(game.gameTime);
            const pick = formData.get(`game-${index}`);
            return {
                matchup: `${game.home} vs ${game.away}`,
                gameId: game.gameId,
                pick: isLocked ? 'Locked' : pick || 'Missing'
            };
        });

        const payload = {
            func: 'submitWeeklyPicks',
            token: localStorage.getItem('token'),
            year,
            week,
            email: localStorage.getItem('email'),
            picks
        };

        try {
            console.log('Submitting picks:', payload);
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status === 'success') {
                setToast({ message: 'Picks submitted successfully!', type: 'success' });
                setSubmitStatus('✅ Picks submitted successfully!');
                setSubmitting(false);
                setToast({ message: `Updating game data...`, type: 'info' });

                // Clear local storage cache to force refresh
                localStorage.removeItem('pickem_games');
                const fetchData = await fetchGameData(true);
                if (fetchData) {
                    setGames(fetchData.games || []);
                    setCurrentPicks(() => {
                        const initial = {};
                        fetchData.games.forEach(game => {
                            if (game.userPick) initial[game.gameId] = game.userPick;
                        });
                        return initial;
                    });
                    setYear(fetchData.year || null);
                    setWeek(fetchData.week || null);
                }
            } else {
                setToast({ message: `Submission failed: ${data.message}`, type: 'error' });
                setSubmitStatus(`❌ Submission failed: ${data.message}`);
            }
        } catch (err) {
            setToast({ message: `Submission failed: ${err}`, type: 'error' });
            setSubmitStatus('❌ Submission error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ***********************************************************************
    // Helper function to format ISO date string to local time
    // ***********************************************************************
    const formatGameDate = (iso) => {
        const date = new Date(iso);
        return date.toLocaleString('en-US', {
            timeZone: 'America/New_York',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // ***********************************************************************
    // Helper function to format spread values
    // ***********************************************************************
    const formatSpread = (value) => {
        if (!value || isNaN(parseFloat(value))) return 'TBD';
        const num = parseFloat(value);
        return num >= 0 ? `+${num}` : `${num}`;
    };

    // ***********************************************************************
    // Render the pick form
    // ***********************************************************************
    return (
        <div className="pick-form-wrapper">
            <form onSubmit={handleSubmit} className="form-container">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast({ message: '', type: '' })}
                />

                {/* 🏈 Title */}
                <h2 className="form-title">{year} Week {week} Pick'em</h2>

                {/* 📘 Instructions */}
                <div className="form-instructions">
                    <p>Make your picks for this week's games. Select Home or Away to accept the spread or indicate if you think the game will go Over or Under the point spread.</p>
                    <p>Note: Game picks cannot be submitted after kickoff.</p>
                </div>

                {/* 📧 Email Info */}
                <div className="game-card email-card">
                    <div className="email-row">
                        <label htmlFor="userEmail" className="email-label">Email:</label>
                        <input
                            id="userEmail"
                            type="email"
                            name="userEmail"
                            value={localStorage.getItem('email')}
                            required
                            disabled
                            className="email-input"
                        />
                    </div>
                </div>

                {/* 🧩 Game Entries */}
                {games.map((game, index) => {
                    const isLocked = new Date() > new Date(game.gameTime);

                    return (
                        <div key={game.gameId || index} className={`game-card ${isLocked ? 'locked' : ''}`}>
                            {/* Game Header */}
                            <div className="game-header">
                                <h4>Game {index + 1}: {formatGameDate(game.gameTime)}</h4>
                            </div>

                            {/* Matchup Info */}
                            <div className="game-info">
                                <p className='Away'>{game.away} ({formatSpread(game.awaySpread)})</p>
                                <p className='vs'>--- vs ---</p>
                                <p className='Home'>{game.home} ({formatSpread(game.homeSpread)})</p>
                                <p className="ou-line">Over / Under: {formatSpread(game.overUnder)}</p>
                            </div>

                            {/* Betting Choices */}
                            <div className="game-picks">
                                {['Home', 'Away', 'Over', 'Under'].map((option) => {
                                    const inputId = `game-${index}-${option}`;
                                    const currentPick = currentPicks[game.gameId];
                                    const prevPick = game.userPick;

                                    const isCurrent = currentPick === option;
                                    const isPrevious = prevPick === option;

                                    let labelClass = 'radio-label';
                                    if (isCurrent) {
                                        labelClass += ' selected-pick';
                                    } else if (prevPick && isPrevious && currentPick !== prevPick) {
                                        labelClass += ' previous-pick';
                                    }

                                    return (
                                        <div key={option} className="radio-item">
                                            <input
                                                type="radio"
                                                id={inputId}
                                                name={`game-${index}`}
                                                value={option}
                                                className="radio-input"
                                                checked={isCurrent}
                                                onChange={() =>
                                                    setCurrentPicks(prev => ({ ...prev, [game.gameId]: option }))
                                                }
                                            />
                                            <label htmlFor={inputId} className={labelClass}>
                                                {option}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Submission Timestamp */}
                            <div className="game-pick-info">
                                {game.userPick && game.userPickTimestamp ? (
                                    <p>
                                        🕒 Pick submitted: {new Date(game.userPickTimestamp).toLocaleString('en-US', {
                                            timeZone: 'America/New_York',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                ) : (
                                    <p style={{ fontStyle: 'italic', color: '#888' }}>No pick submitted yet.</p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 🚀 Footer Buttons */}
                <div className="sticky-submit">
                    <button type="submit" disabled={submitting || allGamesLocked} className="submit-button">
                        {submitting ? '📤 Submitting...' : 'Submit Picks'}
                    </button>

                    <button type="button" onClick={handleClear} className="clear-button">
                        Clear Picks
                    </button>
                </div>
            </form>
        </div>
    );

};

export default PickForm;