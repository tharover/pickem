import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const appScriptUrl = `https://pickem-proxy-git-main-tharovers-projects.vercel.app/api/proxy`;

    // **********************************************************************
    // Handle form submission
    // **********************************************************************
    const handleLogin = async (e) => {
        e.preventDefault();

        // Assuming these are controlled form inputs stored in state
        const payload = {
            func: 'doLogin', 
            username: username.trim(),
            password: password.trim()
        };

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
                navigate('/home');
            } else {
                console.error('Login error:', response);
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <form autoComplete='off' onSubmit={handleLogin} style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2>Pick’em Login</h2>
            <label>
                Email:
                <input value={username} onChange={e => setUsername(e.target.value)} required />
            </label>
            <br />
            <label>
                Password:
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button type="submit">Log In</button>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </form>
    );
}


