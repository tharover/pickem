import React, { useState, useEffect } from 'react';
import { PROXY_URL } from '../config';
import '../styles/PickForm.css';

const PickForm = ({ games, year, week }) => {
    const [submitStatus, setSubmitStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ***********************************************************************
    // Toast notification component
    // ***********************************************************************
    const [toast, setToast] = useState({ message: '', type: '' });
    function Toast({ message, type }) {
        return (
            <div className={`toast ${type}`}>
                {message}
            </div>
        );
    }
    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);


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
            setToast({ message: 'Please make a pick for all unlocked games!', type: 'warning' });
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
            setSubmitStatus(data.status === 'success'
                ? '✅ Picks submitted successfully!'
                : `❌ Submission failed: ${data.message}`);
        } catch (err) {
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
    // Render the pick form
    // ***********************************************************************
    return (
        <form onSubmit={handleSubmit} className="form-container">
            {toast.message && <Toast message={toast.message} type={toast.type} />}
            <h2>🏈 {year} Week {week} Pick'em</h2>

            <div className="form-instructions">
                <p>Make your picks for this week's games. Select Home or Away to accept the spread or indicate if you think the game will go Over or Under the point spread.</p>
                <p>Note: Game picks cannot be submitted after kickoff.</p>
            </div>

            <div className="game-card" style={{ marginBottom: '1rem' }}>
                <label htmlFor='userEmail' className="email-label">
                    Email:
                </label>
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

            {games.map((game, index) => {
                const isLocked = new Date() > new Date(game.gameTime);
                return (
                    <div key={index} className={`game-card ${isLocked ? 'locked' : ''}`}>
                        <input type="hidden" name="id" key={`game-${index}-id`} value={game.gameId} />
                        <legend>
                            {game.home} vs {game.away} – {formatGameDate(game.gameTime)}
                            {isLocked && <span style={{ color: 'gray', marginLeft: '0.5rem' }}>🕒 Locked</span>}
                        </legend>

                        <div className="radio-group">
                            <div className="group-column">
                                {['Home', 'Away'].map((option) => {
                                    const inputId = `game-${index}-${option}`;
                                    return (
                                        <div key={option} className="radio-item">
                                            <input
                                                type="radio"
                                                id={inputId}
                                                name={`game-${index}`}
                                                value={option}
                                                className="radio-input"
                                            />
                                            <label htmlFor={inputId} className="radio-label">
                                                {option}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="group-column">
                                {['Over', 'Under'].map((option) => {
                                    const inputId = `game-${index}-${option}`;
                                    return (
                                        <div key={option} className="radio-item">
                                            <input
                                                type="radio"
                                                id={inputId}
                                                name={`game-${index}`}
                                                value={option}
                                                className="radio-input"
                                            />
                                            <label htmlFor={inputId} className="radio-label">
                                                {option}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <input type="hidden" name="id" key="id" value={game.gameId} />

                        {isLocked && <p style={{ color: 'gray' }}>🕒 Locked — game in progress</p>}


                    </div>
                );
            })}

            <div className="sticky-submit">
                <button type="submit" disabled={submitting}>
                    {submitting ? '📤 Submitting...' : 'Submit Picks'}
                </button>

                <button type="button" onClick={handleClear} className="clear-button">
                    Clear Picks
                </button>

            </div>

        </form>
    );
};

export default PickForm;