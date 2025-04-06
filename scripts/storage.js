/**
 * Storage utility for saving and retrieving data from localStorage
 */
const Storage = {
    // Save data to localStorage
    save: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    // Get data from localStorage
    get: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    // Clear specific data
    clear: function(key) {
        localStorage.removeItem(key);
    }
};