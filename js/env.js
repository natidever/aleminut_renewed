// Initialize window.ENV
window.ENV = window.ENV || {};

// For local development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
        const response = await fetch('/config.local.js');
        const text = await response.text();
        eval(text); // This will set window.ENV
    } catch (error) {
        console.warn('Local config not found, using production environment');
    }
} 