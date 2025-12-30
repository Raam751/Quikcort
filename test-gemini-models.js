require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error('❌ Error: GEMINI_API_KEY is missing in .env file');
        process.exit(1);
    }

    console.log('Listing available models...');

    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        if (response.status === 200) {
            console.log('✅ Success! API Key is valid.');
            console.log('Available Models:');
            const models = response.data.models || [];
            models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        }
    } catch (error) {
        console.error('❌ API Call Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

listModels();
