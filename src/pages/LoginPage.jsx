import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import '../styles/Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    const appScriptUrl = `https://pickem-proxy-git-main-tharovers-projects.vercel.app/api/proxy`;

    // **********************************************************************
    // Handle form submission
    // **********************************************************************
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Ensure username and password are not empty
        if (!username || !password) {
            setToast({ message: 'Please enter both username and password', type: 'warning' });
            setLoading(false);
            return;
        }

        // Assuming these are controlled form inputs stored in state
        const payload = {
            func: 'doLogin',
            username: username.trim(),
            password: password.trim()
        };

        // Send login request to the App Script
        try {
            const res = await fetch(appScriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const response = await res.json();

            console.log('Login status:', response.status);
            if (response.status === 'success' && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('email', username);
                navigate('/');
            } else {
                console.error('Login error:', response);
                setToast({ message: 'Invalid username or password', type: 'warning' });
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
            setLoading(false);
        }
    };

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


