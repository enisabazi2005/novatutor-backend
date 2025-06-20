const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const systemPrompt = req.body.systemPrompt;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Improved custom response for creator/developer questions
  const normalized = userMessage.trim().toLowerCase().replace(/[^a-z0-9 ]/gi, '');
  const creatorRegex = /who (created|developed|made|built)[a-z ]*(you|this|novatutor)/i;
  if (creatorRegex.test(normalized)) {
    return res.json({
      message: "I was trained by Enis Abazi, a fullstack highly skilled developer in Vushtrri. Would you like to learn more about Enis?"
    });
  }

  // Custom response for learning more about Enis
  const learnMoreRegex = /^(yes|i (want|would like) to learn more about enis|tell me more about enis|more about enis|who is enis|learn more about enis)/i;
  if (learnMoreRegex.test(normalized)) {
    return res.json({
      message: "Enis Abazi is a fullstack developer with 2.5+ years of professional experience. Enis started learning code when he was 16, is currently 20 years old, works with custom clients, and in his free time turns errors into miracles."
    });
  }

  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo-0613',
        messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const aiMessage = response.data.choices[0].message.content;
    res.json({ message: aiMessage });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 