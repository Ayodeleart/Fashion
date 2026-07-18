import { NextRequest, NextResponse } from "next/server";

// Same Groq model/provider as /api/ai/design, for one consistent AI cost
// profile across the app. This endpoint is deliberately separate from that
// one — it has a different job (drafting a message, not suggesting styles)
// and no reason to share a system prompt or catalog context.
const GROQ_MODEL = "llama-3.3-70b-versatile";

const MODE_PROMPTS: Record<"appointment" | "enquiry", string> = {
  appointment: `You are a friendly front-desk assistant for AyodeleGold, a
bespoke African tailoring house. The customer is booking an appointment —
help them turn a casual chat into a short, clear message for the tailoring
team covering: what they want the appointment for (fitting, consultation,
bespoke order, alteration, etc.), any specific piece/style they have in
mind, and anything else relevant (occasion, timing preference, sizing
concerns). Ask at most one short clarifying question at a time if you're
missing something important — don't interrogate them. Once you have enough
to work with, write out the actual draft message on its own, prefixed
exactly with "DRAFT:" on its own line, so the app can extract it
automatically. Keep the draft itself under 80 words, written as the
customer's own message (first person), warm but concise. Never invent
availability, prices, or promise a specific appointment slot — that's for
the team to confirm.`,
  enquiry: `You are a friendly front-desk assistant for AyodeleGold, a
bespoke African tailoring house. The customer has a general question or
enquiry (not necessarily booking anything) — help them turn a casual chat
into a short, clear message for the team. Ask at most one short clarifying
question at a time if needed, don't interrogate them. Once you have enough
to work with, write out the actual draft message on its own, prefixed
exactly with "DRAFT:" on its own line, so the app can extract it
automatically. Keep the draft itself under 80 words, written as the
customer's own message (first person), warm but concise. Never invent
prices, stock availability, or delivery timelines.`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, history, mode, context } = await request.json();
    const text = String(message ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Tell me a little about what you need first." });
    }

    const resolvedMode: "appointment" | "enquiry" = mode === "enquiry" ? "enquiry" : "appointment";

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI assistant isn't configured yet — GROQ_API_KEY is missing." });
    }

    const contextLine = typeof context === "string" && context.trim() ? `\n\nFor context, the customer got here from: ${context.trim()}.` : "";
    const systemPrompt = MODE_PROMPTS[resolvedMode] + contextLine;

    const priorTurns: { role: "user" | "assistant"; content: string }[] = Array.isArray(history)
      ? history
          .filter((m: unknown): m is { role: string; content: string } =>
            typeof m === "object" && m !== null && "role" in m && "content" in m
          )
          .map((m): { role: "user" | "assistant"; content: string } => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content),
          }))
          .slice(-10)
      : [];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...priorTurns,
          { role: "user", content: text },
        ],
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq error: ${errText}`);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from Groq.");

    // Pull out the DRAFT: section if the model produced one, so the UI can
    // offer "use this" without the customer having to copy/paste manually.
    const draftMatch = reply.match(/DRAFT:\s*([\s\S]+)$/i);
    const draft = draftMatch ? draftMatch[1].trim() : null;

    return NextResponse.json({ reply, draft });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." });
  }
}
