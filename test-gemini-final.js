require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: "Hello" }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );
        console.log(`✅ Success with ${modelName}!`);
        return true;
    } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.response ? error.response.status : error.message}`);
        if (error.response) console.log(JSON.stringify(error.response.data, null, 2));
        return false;
    }
}

async function runTests() {
    await testModel('gemini-flash-latest');
}

runTests();
