import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [group, setGroup] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const appScriptUrl = 'https://script.google.com/macros/s/AKfycbwPMF0tBSsCmm19z3pEN2yiXc1oXINfsu1-a-JYJ8-L9qn4w_0RDrNzWW7fNCZaelH-/exec';

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `https://script.google.com/macros/s/AKfycbwPMF0tBSsCmm19z3pEN2yiXc1oXINfsu1-a-JYJ8-L9qn4w_0RDrNzWW7fNCZaelH-/exe?func=doLogin&group=${encodeURIComponent(group)}&password=${encodeURIComponent(password)}`
            );
            const data = await res.json();

            if (data.status === 'success' && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/home'); // or wherever your protected routes start
            } else {
                setError('Invalid group or password.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2>Pick’em Login</h2>
            <label>
                Group Name:
                <input value={group} onChange={e => setGroup(e.target.value)} required />
            </label>
            <label>
                Password:
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button type="submit">Log In</button>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </form>
    );
}


