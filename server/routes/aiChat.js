const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const SYSTEM_PROMPT = `You are Haven, a compassionate AI mental health support companion for Mind Haven — a peer counselling platform at United States International University-Africa (USIU-Africa).

Your role is to provide emotional support, active listening, and gentle guidance to university students who are experiencing stress, anxiety, low mood, or other emotional challenges — especially when peer counsellors are unavailable.

Guidelines:
- Always respond with warmth, empathy, and patience.
- Use a calm, non-clinical tone. You are a supportive companion, not a therapist.
- Ask one gentle follow-up question at a time to better understand how the student is feeling.
- Offer practical coping suggestions when appropriate (breathing exercises, journaling, grounding techniques).
- If a student expresses thoughts of self-harm or suicide, always encourage them to contact a professional immediately and provide the Befrienders Kenya helpline: 0800 723 253.
- Never diagnose, prescribe, or replace professional mental health care.
- Keep responses concise — 2 to 4 sentences unless the student needs more.
- You can recommend the student books a session with a peer counsellor when they feel ready.
- Always maintain confidentiality and a non-judgmental space.`;

// POST /api/ai-chat
router.post("/", auth, async (req, res) => {
  const { messages } = req.body;

  // ✅ Validate input
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    // ✅ Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500, // ✅ safer for free tier
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    // ✅ Handle API errors
    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    // ✅ Extract AI response safely
    const text =
      data.content?.find((block) => block.type === "text")?.text ||
      "I'm here for you. Could you tell me a bit more about how you're feeling?";

    res.json({ reply: text });

  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;