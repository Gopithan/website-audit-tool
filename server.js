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

// API Route for Scraping (Avoids CORS/403 errors)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });

    res.send(response.data);
  } catch (error) {
    console.error("Scrape Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: `Could not fetch the page: ${error.message}`
    });
  }
});

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

