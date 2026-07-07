import { NextRequest, NextResponse } from "next/server";

// Uses the same Groq model as the admin transaction editor, for one
// consistent AI provider/cost profile across the whole portfolio.
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Aria, the in-app style assistant for Ariana Fashion, a tailoring
and ready-to-wear e-commerce brand. A customer is asking for a design,
fabric, or color suggestion. Give a short, warm, specific answer (2-4
sentences) — real fabric names, color pairings, or silhouette ideas, not
generic advice like "wear what makes you happy". If their request is too
vague to answer well, ask exactly one clarifying question instead of
guessing. Never invent a specific product, price, or promise a delivery
date — you don't have access to the live catalog.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const text = String(message ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Tell me a bit about what you're looking for." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI styling isn't configured yet — GROQ_API_KEY is missing." });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq error: ${errText}`);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from Groq.");

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." });
  }
}
