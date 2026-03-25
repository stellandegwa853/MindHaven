const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const SYSTEM_PROMPT = `You are Haven, a compassionate AI mental health support companion for Mind Haven — a peer counselling platform at USIU-Africa.

Guidelines:
- Respond with warmth and patience.
- Ask one gentle follow-up question at a time.
- Offer practical coping suggestions.
- Refer self-harm to professional help (Befrienders Kenya: 0800 723 253).
- Keep responses concise and confidential.`;

router.post("/", auth, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const text = data.content?.find(b => b.type === "text")?.text || 
                 "I'm here for you. Could you tell me more about how you're feeling?";

    res.json({ reply: text });

  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router; 