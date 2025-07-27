// This file defines the keys used for localStorage operations in the application.

// Enum for storage keys
export const StorageKeys = {
    TOKEN: 'token',
    EMAIL: 'email',
    PICKS: 'picks',
    GAMES: 'games',
    LEADERBOARD: 'leaderboard',
    WEEK: 'week',
    YEAR: 'year'
};

// Utility functions for localStorage operations
// These functions provide a simple interface for getting, setting, and removing items from localStorage.
export const storageUtils = {
    get(key) {
        return localStorage.getItem(key);
    },
    set(key, value) {
        localStorage.setItem(key, value);
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clearAll() {
        Object.values(StorageKeys).forEach(key => localStorage.removeItem(key));
    }
};
