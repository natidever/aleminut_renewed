exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            OPENAI_API_KEY: process.env.OPENAI_API_KEY
        })
    };
}; 