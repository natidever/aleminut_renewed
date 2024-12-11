// Initialize window.ENV
window.ENV = window.ENV || {};

// For local development
async function loadEnvironment() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development
        window.ENV.OPENAI_API_KEY = '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';
    } else {
        // Production environment (Netlify)
        try {
            const response = await fetch('/.netlify/functions/get-env');
            const data = await response.json();
            window.ENV.OPENAI_API_KEY = data.OPENAI_API_KEY;
        } catch (error) {
            console.warn('Failed to load production environment, falling back to local');
            window.ENV.OPENAI_API_KEY = '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';
        }
    }
}

// Load environment immediately
loadEnvironment();

export default window.ENV; 