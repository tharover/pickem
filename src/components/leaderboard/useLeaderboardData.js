import { useState, useEffect, useCallback } from 'react';
import { StorageKeys, storageUtils } from '../../utils/storageUtils';
import { ProxyFunctions, proxyRequest } from '../../utils/proxy';

export default function useLeaderboardData({ navigate, setToast }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const loadData = useCallback(async () => {
    const tokenRaw = storageUtils.get(StorageKeys.TOKEN);
    const token = tokenRaw ? JSON.parse(tokenRaw) : null;

    if (!token) {
      console.warn('🔐 No token found — redirecting to login');
      storageUtils.clearAll();
      navigate('/login');
      return;
    }

    setStatus('loading');
    setData(null);

    try {
      const response = await proxyRequest(ProxyFunctions.GET_LEADERBOARD, { token });

      if (response.code === 401) {
        console.warn('🔐 Token invalid — redirecting to login');
        storageUtils.clearAll();
        navigate('/login');
        return;
      }

      if (response.status !== 'success' || response.code !== 200 || !response.data?.games) {
        console.warn('Leaderboard fetch failed:', response);
        setStatus('error');
        return;
      }

      console.log('Leaderboard response: ', response);

      setData(response.data);
      setStatus('success');
      setToast({ message: 'Leaderboard loaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setStatus('error');
    }
  }, [navigate, setToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setStatus('refreshing');
    await loadData();
  };

  return { data, status, refresh };
}
