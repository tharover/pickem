import { StorageKeys, storageUtils } from './storageUtils';

const PROXY_URL = process.env.REACT_APP_APPSCRIPT_URL || 'https://pickem-proxy-git-main-tharovers-projects.vercel.app/api/proxy';

/**********************************************************************
 * Proxy Utility Functions
 * These functions handle requests to the backend via a proxy server.
 * They are used for both session-based and auth-related requests.
 **********************************************************************/
export const ProxyFunctions = {
    IS_ALIVE: { method: 'GET', func: 'isAlive', tokenRequired: false },
    GET_ALL_PLAYERS: { method: 'GET', func: 'getAllPlayers', tokenRequired: true },
    VALIDATE_TOKEN: { method: 'POST', func: 'validateToken', tokenRequired: false },
    GET_SELECTED_GAMES: { method: 'POST', func: 'fetchSelectedGames', tokenRequired: true },
    GET_LEADERBOARD: { method: 'POST', func: 'getLeaderboard', tokenRequired: true },
    DO_LOGIN: { method: 'POST', func: 'doLogin', tokenRequired: false },
    SUBMIT_WEEKLY_PICKS: { method: 'POST', func: 'submitWeeklyPicks', tokenRequired: true }
};

// -------------------------------------------------------------------
// PROXY REQUEST HANDLER 
// -------------------------------------------------------------------
// This function handles making requests to the proxy server.
// It takes a function definition, payload, and optional user token.
// See the ProxyFunctions object for available functions.
// -------------------------------------------------------------------
export async function proxyRequest(proxyFunc, payload = {}) {
    const { method, func, tokenRequired } = proxyFunc;

    let url = PROXY_URL;
    let options = { method };

    if (method === 'GET') {
        const queryParams = new URLSearchParams(payload).toString();
        url += queryParams ? `?${queryParams}` : '';
    } else {
        // Grab token from localStorage
        const token = storageUtils.get(StorageKeys.TOKEN);
        if (tokenRequired && !token) {
            console.error('No token found in localStorage, redirecting to login');
            return {};
        }

        const body = tokenRequired ? { ...payload, token, func } : { ...payload, func };
        console.log(`proxyRequest: ${func} with payload:`, body);
        options.body = JSON.stringify(body);
        options.headers = { 'Content-Type': 'application/json' };
    }

    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`proxyRequest error for ${func}:`, err);
        throw err;
    }
}
