const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch@2
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const LM_STUDIO_URL = 'http://127.0.0.1:1234/v1/chat/completions';
const MODEL_ID = 'deepseek-r1-distill-qwen-7b';

app.post('/analyze', async (req, res) => {
  const { parentResponses, childResponses, systemPrompt, userPrompt } = req.body;

  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error calling LM Studio:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`LLM backend listening on http://localhost:${PORT}`);
}); 