import env from './env.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get API key from environment
    const OPENAI_API_KEY = env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not found');
        return;
    }

    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesContainer = document.getElementById('messages');
    const sendButton = document.querySelector('.send-button');
    const themeToggle = document.querySelector('.theme-toggle');

    // OpenAI Configuration
    const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    
    // Enhanced rate limiting configuration
    const RATE_LIMIT_CONFIG = {
        initialDelay: 1000,    // Start with 1 second delay
        maxDelay: 60000,       // Maximum delay of 60 seconds
        backoffFactor: 2,      // Double the delay after each retry
        maxRetries: 3          // Maximum number of retries
    };

    // Retry function with exponential backoff
    async function retryWithBackoff(fn, retryCount = 0) {
        try {
            return await fn();
        } catch (error) {
            if (error.response?.status === 429 && retryCount < RATE_LIMIT_CONFIG.maxRetries) {
                const delay = Math.min(
                    RATE_LIMIT_CONFIG.initialDelay * Math.pow(RATE_LIMIT_CONFIG.backoffFactor, retryCount),
                    RATE_LIMIT_CONFIG.maxDelay
                );
                
                addMessage('system', `Rate limit reached. Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return retryWithBackoff(fn, retryCount + 1);
            }
            throw error;
        }
    }

    // Request queue
    let isProcessing = false;
    const requestQueue = [];

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
        
        // Enable/disable send button based on input
        sendButton.disabled = !userInput.value.trim();
    });

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Check if we're already processing
        if (isProcessing) {
            addMessage('system', 'Please wait for the previous response...');
            return;
        }

        addMessage('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';
        sendButton.disabled = true;
        showTypingIndicator();
        isProcessing = true;

        try {
            const response = await retryWithBackoff(async () => await axios.post(OPENAI_API_ENDPOINT, {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: message
                }],
                temperature: 0.7,
                max_tokens: 1000
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Access-Control-Allow-Origin': 'your-domain.com'
                }
            }));

            removeTypingIndicator();
            const aiResponse = response.data.choices[0].message.content;
            addMessage('ai', aiResponse);

        } catch (error) {
            console.error('OpenAI API Error:', error);
            removeTypingIndicator();
            
            if (error.response?.status === 429) {
                addMessage('system', 'Rate limit exceeded. Please try again in a few moments.');
            } else if (error.response?.status === 401) {
                addMessage('system', 'Authentication error. Please check the API key.');
            } else {
                addMessage('ai', generateResponse(message));
            }
        } finally {
            isProcessing = false;
        }
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.documentElement.setAttribute(
            'data-theme',
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        );
    });

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}${type === 'system' ? ' system-message' : ''}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${type === 'user' ? '👤' : type === 'system' ? '⚠️' : '🤖'}
            </div>
            <div class="message-content">
                ${content}
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        indicator.scrollIntoView({ behavior: 'smooth' });
    }

    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }

    function generateResponse(message) {
        const responses = [
            "I understand you're saying: " + message,
            "That's an interesting point about: " + message,
            "Let me think about: " + message,
            "Here's what I know about: " + message
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}); 