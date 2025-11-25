const axios = require('axios');
require('dotenv').config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log('Testing Gemini API with key:', API_KEY ? 'Present' : 'Missing');

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: "Hello, are you working?"
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        console.log('Success!');
        console.log('Response:', response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGemini();
