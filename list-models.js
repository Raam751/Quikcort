const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const LIST_MODELS_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    console.log('Listing available models...');

    try {
        const response = await axios.get(LIST_MODELS_URL);

        console.log('Available models:');
        const models = response.data.models;

        // Filter for models that support generateContent
        const generateModels = models.filter(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
        );

        generateModels.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
        });

        if (generateModels.length === 0) {
            console.log('No models found that support generateContent.');
        }
    } catch (error) {
        console.error('Error listing models:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

listModels();
