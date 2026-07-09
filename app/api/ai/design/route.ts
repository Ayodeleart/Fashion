import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Uses the same Groq model as the admin transaction editor, for one
// consistent AI provider/cost profile across the whole portfolio.
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function buildSystemPrompt(): Promise<string> {
  const admin = createAdminClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    admin.from("ariana_categories").select("name").order("position", { ascending: true }),
    admin
      .from("ariana_products")
      .select("name, category")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const categoryNames = [...new Set((categories ?? []).map((c) => c.name))];
  const productNames = [...new Set((products ?? []).map((p) => p.name))];

  const catalogLine =
    categoryNames.length > 0
      ? `The categories we actually carry are: ${categoryNames.join(", ")}.`
      : "";
  const examplesLine =
    productNames.length > 0
      ? ` Recent pieces in stock, for reference on naming/style: ${productNames.slice(0, 15).join(", ")}.`
      : "";

  return `You are Aria, the in-app style assistant for AyodeleGold, a modern
African tailoring house (menswear and womenswear, bespoke and
ready-to-wear — think agbada, aso oke, senator wear, kaftans, ankara,
and similar, not Western basics). ${catalogLine}${examplesLine}

Only suggest garments, fabrics, and styles consistent with what this
brand actually carries above. NEVER suggest generic Western items like
jeans, t-shirts, or plain suits unless they genuinely appear in that
list — that is a real, common failure mode you must avoid. If nothing
in the list fits what the customer described, say so honestly and
suggest the closest thing we do carry instead of inventing an
unrelated item.

Give a short, warm, specific answer (2-4 sentences) — real fabric
names, color pairings, or silhouette ideas, not generic advice like
"wear what makes you happy". If their request is too vague to answer
well, ask exactly one clarifying question instead of guessing. Never
invent a specific price or promise a delivery date.`;
}

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

    const systemPrompt = await buildSystemPrompt();

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
