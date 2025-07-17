import React, { useEffect, useState } from 'react';
import { PROXY_URL } from '../config'; 
import '../styles/StatusPage.css'; 

const StatusPage = () => {
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const checkService = async () => {
            try {
                const res = await fetch(`${PROXY_URL}?func=isAlive`);
                const json = await res.json();

                if (json.status === 'success') {
                    setStatusData(json);
                } else {
                    setError(json.message || 'Unexpected response');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Unable to reach service');
            } finally {
                setLoading(false); // ✅ End loading
            }

        };

        checkService();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>🏈 Pick'em Proxy Status</h2>
            <p><strong>Proxy URL:</strong> {PROXY_URL}</p>

            {error && !loading && <p style={{ color: 'red' }}>❌ {error}</p>}

            {loading && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <div className="spinner" />
                    <p>🔍 Checking proxy status... hang tight!</p>
                </div>
            )}

            {error && !loading && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>❌ {error}</p>
            )}

            {statusData && !loading && (
                <div style={{
                    marginTop: '1rem',
                    background: '#f0f0f0',
                    padding: '1rem 1.5rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3>Proxy Status</h3>
                    <p><strong>✅ Status:</strong> {statusData.status}</p>
                    <p><strong>📦 Code:</strong> {statusData.code}</p>
                    <p><strong>📣 Message:</strong> {statusData.message}</p>
                    <p><strong>🕒 Timestamp:</strong> {statusData.timestamp}</p>
                    <p><strong>🧭 Query:</strong> {statusData.data?.queryString}</p>
                </div>
            )}
        </div>
    );
};

export default StatusPage;