## Setup

### Local Development
1. Copy `js/config.local.js.example` to `js/config.local.js`
2. Add your OpenAI API key to `config.local.js`
3. Never commit `config.local.js`
4. Open index.html in your browser

### Production Deployment (Netlify)
1. Go to Netlify dashboard > Site settings > Environment variables
2. Add `OPENAI_API_KEY` with your production API key
3. Deploy your site

### Important Security Notes
- Never commit API keys or sensitive data
- Always use environment variables in production
- Keep `config.local.js` in .gitignore