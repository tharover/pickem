import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import '../styles/PickForm.css';
import { StorageKeys, storageUtils } from '../utils/storageUtils';
import { ProxyFunctions, proxyRequest } from '../utils/proxy';

const PickForm = ({ games, setGames, year, setYear, week, setWeek }) => {
    const [submitStatus, setSubmitStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPicks, setCurrentPicks] = useState({});
    const [toast, setToast] = useState({ message: '', type: '' });
    const navigate = useNavigate();
    const allGamesLocked = games.length > 0 && games.every(game => new Date() > new Date(game.gameTime));

    useEffect(() => {
        // Always update year and week in local storage on load
        if (year) storageUtils.set(StorageKeys.YEAR, year);
        if (week) storageUtils.set(StorageKeys.WEEK, week);
        const initial = {};
        games.forEach(game => {
            if (game.userPick) {
                initial[game.gameId] = game.userPick;
            }
        });
        setCurrentPicks(initial);
    }, [games, year, week]);

    // ***********************************************************************
    // Normalize games data to ensure consistent structure
    // Handles both array and object formats
    // ***********************************************************************
    function normalizeGames(gamesData) {
        return Array.isArray(gamesData)
            ? gamesData
            : Object.values(gamesData || {});
    }

    // ***********************************************************************
    // Handle refreshing form
    // ***********************************************************************
    async function handleRefresh() {
        setRefreshing(true);

        try {
            // Fetch fresh game data
            console.log('Refreshing game data...');
            const email = storageUtils.get(StorageKeys.EMAIL);
            const token = storageUtils.get(StorageKeys.TOKEN);
            const response = await proxyRequest(
                ProxyFunctions.GET_SELECTED_GAMES,
                { email, token: JSON.parse(token) }
            );
            const status = response?.status;
            const code = response?.code;
            if (code === 401) {
                console.warn('🔐 Token invalid — redirecting to login');
                storageUtils.clearAll(); // ✅ wipe all data
                navigate('/login');
                return;
            }
            if (status !== 'success' || code !== 200) {
                console.warn('Game data fetch failed:', response);
                setToast({ message: 'Could not refresh game data.', type: 'error' });
                setRefreshing(false);
                return;
            }
            const data = response?.data;
            if (!data) {
                setToast({ message: 'No game data available to refresh.', type: 'info' });
                setRefreshing(false);
                return;
            }

            // Update local storage with fresh data
            storageUtils.set(StorageKeys.GAMES, JSON.stringify({ games: data.games, timestamp: Date.now() }));
            storageUtils.set(StorageKeys.YEAR, response.year);
            storageUtils.set(StorageKeys.WEEK, response.week);

            // Update state with fresh data
            const normalized = normalizeGames(data.games);
            setGames(normalized);
            setYear(response.year || null);
            setWeek(response.week || null);
            setCurrentPicks(() => {
                const initial = {};
                normalized.forEach(game => {
                    if (game.userPick) initial[game.gameId] = game.userPick;
                });
                return initial;
            });

            setToast({ message: 'Your picks were refreshed.', type: 'success' });

        } catch (err) {
            console.error('Error refreshing game data:', err);
            setToast({ message: 'Error refreshing game data', type: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    // ***********************************************************************
    // Handle clearing form
    // ***********************************************************************
    const handleClear = () => {
        const form = document.querySelector('.form-container');
        if (!form) return;

        // Reset visible inputs
        form.reset();

        // Reset current picks state
        setCurrentPicks({});

        // Manually clear radio buttons (in case .reset() misses anything)
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => (radio.checked = false));

        // Optionally clear status text or other local states
        setSubmitStatus('');

        // Show toast notification
        setToast({ message: 'Cleared games.', type: 'success' });
    };

    // ***********************************************************************
    // Handle form submission
    // ***********************************************************************
    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitStatus('📤 Submitting your picks...');
        const now = new Date();

        let hasMissingPick = false;

        for (let game of games) {
            const isLocked = now > new Date(game.gameTime);
            const picked = currentPicks[game.gameId];
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

        const picks = games.map(game => {
            const isLocked = now > new Date(game.gameTime);
            const pick = currentPicks[game.gameId];
            return {
                matchup: `${game.home} vs ${game.away}`,
                gameId: game.gameId,
                pick: isLocked ? 'Locked' : pick || 'Missing'
            };
        });


        const tokenRaw = storageUtils.get(StorageKeys.TOKEN);
        const token = tokenRaw ? JSON.parse(tokenRaw) : null;
        const email = storageUtils.get(StorageKeys.EMAIL);
        const year = storageUtils.get(StorageKeys.YEAR);
        const week = storageUtils.get(StorageKeys.WEEK);

        const payload = {
            year,
            week,
            email,
            token,
            picks
        };

        try {
            const response = await proxyRequest(ProxyFunctions.SUBMIT_WEEKLY_PICKS, payload);

            if (response.status === 'success') {
                const { validPicks, errors, summary, games: updatedGames } = response.data || {};
                const normalized = normalizeGames(updatedGames);

                // Merge valid picks into normalized games
                validPicks?.forEach(pick => {
                    const game = normalized.find(g => g.gameId === pick.gameId);
                    if (game) {
                        game.userPick = pick.pick;
                        game.userPickTimestamp = new Date().toISOString(); // or use server timestamp if available
                    }
                });

                setGames(normalized);

                // Update current picks with accepted ones
                const acceptedMap = {};
                validPicks?.forEach(p => {
                    acceptedMap[p.gameId] = p.pick;
                });
                setCurrentPicks(acceptedMap);

                // ✅ Update year/week
                setYear(response.year || null);
                setWeek(response.week || null);
                // Always update year and week in local storage after submit
                if (response.year) storageUtils.set(StorageKeys.YEAR, response.year);
                if (response.week) storageUtils.set(StorageKeys.WEEK, response.week);

                // ✅ Clear cached games
                storageUtils.remove(StorageKeys.GAMES);
            } else {
                setToast({ message: `❌ Submission failed: ${response.message}`, type: 'error' });
                setSubmitStatus(`❌ Submission failed: ${response.message}`);
            }
        } catch (err) {
            console.error('❌ Submission error:', err);
            setToast({ message: `❌ Submission failed: ${err}`, type: 'error' });
            setSubmitStatus('❌ Submission error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };


    // ***********************************************************************
    // Helper function to format ISO date string to local time
    // ***********************************************************************
    const formatGameDate = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString('en-US', {
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
        <>
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
                                value={storageUtils.get(StorageKeys.EMAIL) || ''}
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

                                {isLocked && (
                                    <p className="game-warning">
                                        ⚠️ This game is currently in progress. Picks are disabled.
                                    </p>
                                )}

                                {/* Matchup Info */}
                                <div className="game-info">
                                    <p className='Away'>Away: <b>{game.away}</b> ({formatSpread(game.awaySpread)})</p>
                                    <p className='Home'>Home: <b>{game.home}</b> ({formatSpread(game.homeSpread)})</p>
                                    <p className="ou-line">Over / Under: {formatSpread(game.overUnder)}</p>
                                </div>

                                {/* Betting Choices */}
                                <div className="game-picks">
                                    <p className="pick-instruction">Pick one below:</p>
                                    <div className="radio-group">
                                        {['Home', 'Away', 'Over', 'Under'].map((option) => {
                                            const inputId = `game-${index}-${option}`;
                                            const currentPick = currentPicks[game.gameId];
                                            const prevPick = game.userPick;

                                            const isCurrent = currentPick === option;
                                            const isPrevious = prevPick === option;

                                            let labelClass = 'radio-label';
                                            if (isCurrent) labelClass += ' selected-pick';
                                            else if (prevPick && isPrevious && currentPick !== prevPick) labelClass += ' previous-pick';

                                            return (
                                                <label key={option} htmlFor={inputId} className={labelClass}>
                                                    <input
                                                        type="radio"
                                                        id={inputId}
                                                        name={`game-${index}`}
                                                        value={option}
                                                        className="radio-input"
                                                        checked={isCurrent}
                                                        disabled={isLocked || submitting || refreshing}
                                                        onChange={() =>
                                                            setCurrentPicks(prev => ({ ...prev, [game.gameId]: option }))
                                                        }
                                                    />
                                                    {option}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>


                                {/* Submission Timestamp */}
                                <div className="game-pick-info">
                                    {game.userPick && game.userPickTimestamp ? (
                                        <p>
                                            🕒 Pick submitted: {formatGameDate(game.userPickTimestamp)}
                                        </p>
                                    ) : (
                                        <p style={{ fontStyle: 'italic', color: '#888' }}>No pick submitted yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </form>
            </div>
            <div className="sticky-footer">
                <button type="submit" onClick={handleSubmit} disabled={submitting || allGamesLocked} className="submit-button">
                    {submitting ? '📤 Submitting...' : 'Submit'}
                </button>

                <button type="button" onClick={handleRefresh} disabled={refreshing} className="refresh-button">
                    {refreshing ? '📤 Refreshing...' : 'Refresh'}
                </button>

                <button type="button" onClick={handleClear} className="clear-button">
                    Clear
                </button>
            </div>
        </>
    );

};

export default PickForm;