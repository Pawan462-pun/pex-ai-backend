import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================== MONGODB CONNECT ==================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ================== HEALTH CHECK ==================
app.get("/", (req, res) => {
  res.json({ status: "PAWAN EXPLOITS AI Backend running 🚀" });
});

// ================== CHAT API ==================
app.post("/chat", async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.json({ response: "❌ Invalid messages format" });
    }

    const prompt = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const openaiRes = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
          temperature,
          max_output_tokens: max_tokens
        })
      }
    );

    const data = await openaiRes.json();

    const output =
      data.output?.[0]?.content
        ?.filter(c => c.type === "output_text")
        ?.map(c => c.text)
        ?.join("") || null;

    if (!output) {
      console.error("OpenAI raw response:", data);
      return res.json({ response: "❌ Empty AI response" });
    }

    return res.json({ response: output });

  } catch (err) {
    console.error("Backend error:", err);
    return res.json({ response: "❌ Server error" });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server running on port", PORT);
});
