import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { proxyRequest, ProxyFunctions } from '../utils/proxy';
import { storageUtils, StorageKeys } from '../utils/storageUtils';
import Toast from '../components/Toast';
import '../styles/Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    const navigate = useNavigate();


    // **********************************************************************
    // Handle form submission
    // **********************************************************************
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !password) {
            setToast({ message: 'Please enter both username and password', type: 'warning' });
            setLoading(false);
            return;
        }

        const payload = {
            username: username.trim(),
            password: password.trim()
        };

        try {
            const response = await proxyRequest(ProxyFunctions.DO_LOGIN, payload);

            console.log('Login status:', response.status);

            if (response.status === 'success' && response.data.token) {
                console.log('Login successful:', response.data);
                storageUtils.set(StorageKeys.EMAIL, username);
                storageUtils.set(StorageKeys.TOKEN, JSON.stringify(response.data.token));
                storageUtils.set(StorageKeys.YEAR, JSON.stringify(response.year));
                storageUtils.set(StorageKeys.WEEK, JSON.stringify(response.week));
                storageUtils.set(StorageKeys.GAMES, JSON.stringify({ games: response.data.games, timestamp: Date.now() }));

                navigate('/');
            } else {
                console.error('Login response with error:', response);
                setToast({ message: 'Invalid username or password', type: 'warning' });
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
            setLoading(false);
        }
    };

    // **********************************************************************
    // Render the login form    
    // **********************************************************************
    return (
        <form autoComplete='off' onSubmit={handleLogin} style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2>Pick’em Login</h2>
            <Toast
                message={toast.message}
                type={toast.type}
                onDismiss={() => setToast({ message: '', type: '' })}
            />
            <div className="login-panel">
                <label>
                    Email:
                    <input value={username} onChange={e => setUsername(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </label>
            </div>

            <div className="login-button-wrapper">
                <button type="submit" disabled={loading}>
                    {loading ? '🔄 Logging In...' : 'Log In'}
                </button>
            </div>
        </form>
    );
}


