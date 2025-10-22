const axios = require('axios');
const Case = require('../models/Case');
const Submission = require('../models/Submission');
const Verdict = require('../models/Verdict');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Generate verdict using Gemini AI
const generateVerdict = async (caseId) => {
  try {
    const startTime = Date.now();

    // Get case with all related data
    const caseDoc = await Case.findById(caseId)
      .populate('creator', 'firstName lastName credibilityScore')
      .populate('opposingParty', 'firstName lastName credibilityScore')
      .populate({
        path: 'submissions',
        populate: {
          path: 'submitter',
          select: 'firstName lastName'
        }
      });

    if (!caseDoc || !caseDoc.submissions || caseDoc.submissions.length < 2) {
      throw new Error('Case or submissions not found');
    }

    // Prepare the prompt for Gemini
    const prompt = createVerdictPrompt(caseDoc);

    // Call Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    const verdictData = parseVerdictResponse(aiResponse, caseDoc);

    const processingTime = Date.now() - startTime;

    // Create verdict in database
    const verdict = await Verdict.create({
      case: caseId,
      winner: verdictData.winner,
      loser: verdictData.loser,
      confidenceScore: verdictData.confidenceScore,
      reasoning: verdictData.reasoning,
      keyPoints: verdictData.keyPoints,
      recommendedActions: verdictData.recommendedActions,
      compensation: verdictData.compensation,
      processingTime,
      appealDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return verdict;

  } catch (error) {
    console.error('Error generating verdict:', error);
    throw new Error(`Failed to generate verdict: ${error.message}`);
  }
};

// Create the prompt for Gemini AI
const createVerdictPrompt = (caseDoc) => {
  const creator = caseDoc.creator;
  const opposingParty = caseDoc.opposingParty;
  const submissions = caseDoc.submissions;

  const creatorSubmission = submissions.find(sub => sub.isCreator);
  const opposingSubmission = submissions.find(sub => !sub.isCreator);

  return `
You are an AI mediator for QuikCort, an online dispute resolution platform. Analyze the following case and provide a fair, unbiased verdict.

CASE DETAILS:
Title: ${caseDoc.title}
Description: ${caseDoc.description}
Category: ${caseDoc.category}
Amount in dispute: ${caseDoc.currency} ${caseDoc.amount}

PARTIES:
Creator: ${creator.firstName} ${creator.lastName} (Credibility Score: ${creator.credibilityScore})
Opposing Party: ${opposingParty.firstName} ${opposingParty.lastName} (Credibility Score: ${opposingParty.credibilityScore})

CLAIMS:

Creator's Claim:
${creatorSubmission.claim}
Evidence: ${creatorSubmission.evidence.map(ev => `${ev.type}: ${ev.url} - ${ev.description}`).join(', ') || 'None provided'}

Opposing Party's Claim:
${opposingSubmission.claim}
Evidence: ${opposingSubmission.evidence.map(ev => `${ev.type}: ${ev.url} - ${ev.description}`).join(', ') || 'None provided'}

INSTRUCTIONS:
1. Analyze both claims objectively
2. Consider the evidence provided
3. Consider the credibility scores (but don't rely solely on them)
4. Determine who has the stronger case
5. Provide clear reasoning
6. Suggest appropriate compensation if applicable

RESPOND IN THIS EXACT JSON FORMAT:
{
  "winner": "creator" or "opposing_party",
  "confidenceScore": number between 0-100,
  "reasoning": "detailed explanation of the decision",
  "keyPoints": [
    {
      "point": "key finding or evidence",
      "supportingEvidence": "what supports this point"
    }
  ],
  "recommendedActions": [
    {
      "action": "specific action to take",
      "priority": "high/medium/low"
    }
  ],
  "compensation": {
    "amount": number,
    "currency": "USD",
    "type": "monetary/apology/action/none",
    "description": "explanation of compensation"
  }
}

Be fair, objective, and thorough in your analysis. Consider all available information and provide a well-reasoned decision.
`;
};

// Parse the AI response and extract verdict data
const parseVerdictResponse = (aiResponse, caseDoc) => {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const verdictData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!verdictData.winner || !verdictData.confidenceScore || !verdictData.reasoning) {
      throw new Error('Missing required fields in AI response');
    }

    // Determine winner and loser IDs
    const isCreatorWinner = verdictData.winner === 'creator';
    const winner = isCreatorWinner ? caseDoc.creator._id : caseDoc.opposingParty._id;
    const loser = isCreatorWinner ? caseDoc.opposingParty._id : caseDoc.creator._id;

    return {
      winner,
      loser,
      confidenceScore: Math.max(0, Math.min(100, parseInt(verdictData.confidenceScore))),
      reasoning: verdictData.reasoning,
      keyPoints: verdictData.keyPoints || [],
      recommendedActions: verdictData.recommendedActions || [],
      compensation: {
        amount: verdictData.compensation?.amount || 0,
        currency: verdictData.compensation?.currency || 'USD',
        type: verdictData.compensation?.type || 'none',
        description: verdictData.compensation?.description || ''
      }
    };

  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

// Retry verdict generation with exponential backoff
const generateVerdictWithRetry = async (caseId, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateVerdict(caseId);
    } catch (error) {
      lastError = error;
      console.error(`Verdict generation attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

module.exports = {
  generateVerdict,
  generateVerdictWithRetry
};
