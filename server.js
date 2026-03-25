const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API Route for AI Audit (Gemini)
app.post('/api/audit', async (req, res) => {
  const { systemPrompt, userPrompt } = req.body;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: "Gemini API Key is missing or default in .env file." });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    // Mocking the structure that index.html expects (Anthropic style)
    // index.html expects { content: [{ text: "..." }] }
    res.json({
      content: [{ text: responseText }]
    });

  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({
      error: error.message || "AI Analysis failed",
      details: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;

