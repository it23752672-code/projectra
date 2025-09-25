// server/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // Use Flash for faster chat responses
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
    }
});

async function getChatResponse(message, context) {
    try {
        const prompt = `You are ProJectra AI Assistant. 
User context: ${JSON.stringify(context)}.
User message: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return {
            response: response.text(),
            suggestions: [
                'How can I improve my task estimates?',
                'Show me best practices for remote collaboration',
            ],
            resources: [],
        };
    } catch (error) {
        console.error('Gemini AI error:', error);
        throw new Error('Failed to get Gemini AI response');
    }
}

module.exports = { getChatResponse };
