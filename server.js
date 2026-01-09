import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// 🔑 APNI REAL OPENAI API KEY YAHAN PASTE KARO
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
    res.send("PAWAN EXPLOITS AI Backend running ✅");
});

// ================= CHAT ENDPOINT =================
app.post("/chat", async (req, res) => {
    try {
        const { messages, temperature, max_tokens } = req.body;

        // Basic validation
        if (!messages || !Array.isArray(messages)) {
            return res.json({
                response: "❌ Invalid request: messages missing"
            });
        }

        // Convert chat messages → single prompt
        const prompt = messages
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

        // Call OpenAI Responses API
        const openaiRes = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    input: prompt,
                    temperature: temperature ?? 0.7,
                    max_output_tokens: max_tokens ?? 1000
                })
            }
        );

        const data = await openaiRes.json();

        // 🔎 SAFELY EXTRACT TEXT (NO CRASH)
        const output =
            data.output?.[0]?.content
                ?.filter(c => c.type === "output_text")
                ?.map(c => c.text)
                ?.join("") || null;

        if (!output) {
            console.error("OpenAI raw response:", JSON.stringify(data, null, 2));
            return res.json({
                response: "❌ OpenAI returned empty response"
            });
        }

        // ✅ SEND RESPONSE ONLY ONCE
        return res.json({
            response: output
        });

    } catch (error) {
        console.error("Backend crash:", error);
        return res.json({
            response: "❌ Backend error occurred"
        });
    }
});

// ================= START SERVER =================
app.listen(3000, () => {
    console.log("✅ PAWAN EXPLOITS AI Backend running at http://localhost:3000");
});