import { NextRequest, NextResponse } from "next/server";

// Google's Gemini image-edit model on fal.ai, reached through fal's
// synchronous endpoint (fal.run/...) rather than the queue endpoint —
// no separate polling step needed, matches the plain-fetch pattern used
// by app/api/ai/design/route.ts and app/api/ai/compose/route.ts. It
// takes multiple reference images (the customer's photo + the garment
// photo) plus a natural-language instruction, which is what identity
// preservation + accurate garment reproduction both need — a plain
// clothing-overlay model can't do either.
const FAL_MODEL = "fal-ai/nano-banana/edit";
const GENERATION_TIMEOUT_MS = 45_000;
// Data-URI images roughly ~1.35x their decoded byte size; ~15MB decoded
// is already a very large phone photo, so this catches accidental
// full-resolution uploads before they hit fal.ai's own limits.
const MAX_IMAGE_DATA_URL_LENGTH = 20_000_000;

function buildPrompt(productName: string | undefined) {
  const garmentLine = productName
    ? `the exact garment shown in the second reference image (an item called "${productName}")`
    : "the exact garment shown in the second reference image";

  return (
    `Using the first image as the person and the second image as the garment, generate a single photorealistic, premium fashion-editorial image of THIS SAME PERSON wearing ${garmentLine}. ` +
    "Preserve the person's face, identity, skin tone, hair, and body proportions exactly — do not turn them into a different person. " +
    "Reproduce the garment's actual color, pattern, embroidery, and design details accurately, adapted naturally to the person's body with realistic fabric folds, shadows, and fit. " +
    "If the person's original pose or posture is awkward, correct it into a natural, flattering standing fashion pose, keeping hands, arms, and legs anatomically correct. " +
    "Light it like a professional fashion campaign shoot and place them on a clean, premium studio-quality background that complements the garment. Output one image only."
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }
    const { personImage, productImageUrl, productName } = (body ?? {}) as {
      personImage?: unknown;
      productImageUrl?: unknown;
      productName?: unknown;
    };

    if (typeof personImage !== "string" || !personImage) {
      return NextResponse.json({ error: "A photo of you is required." }, { status: 400 });
    }
    if (personImage.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json({ error: "That photo is too large — try a smaller or lower-resolution image." }, { status: 413 });
    }
    if (typeof productImageUrl !== "string" || !productImageUrl) {
      return NextResponse.json({ error: "That product doesn't have a usable photo yet." }, { status: 400 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI Try-On isn't configured yet — FAL_KEY is missing." },
        { status: 503 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

    let falRes: Response;
    try {
      falRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: buildPrompt(typeof productName === "string" ? productName : undefined),
          image_urls: [personImage, productImageUrl],
          num_images: 1,
          output_format: "jpeg",
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        return NextResponse.json(
          { error: "Generation is taking longer than expected — please try again." },
          { status: 504 }
        );
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

    if (!falRes.ok) {
      // fal.ai error bodies are usually JSON but not guaranteed — never
      // let a non-JSON error body itself throw and mask the real status.
      let detail = "";
      try {
        detail = await falRes.text();
      } catch {
        // ignore — we still have falRes.status below
      }
      console.error(`[api/ai/tryon] fal.ai returned ${falRes.status}: ${detail.slice(0, 500)}`);
      const message =
        falRes.status === 401 || falRes.status === 403
          ? "AI Try-On isn't configured correctly — check the FAL_KEY value."
          : "Couldn't generate that look right now — please try again.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    let data: unknown;
    try {
      data = await falRes.json();
    } catch {
      return NextResponse.json({ error: "Received an unexpected response — please try again." }, { status: 502 });
    }

    const resultUrl = (data as { images?: { url?: string }[] } | null)?.images?.[0]?.url;
    if (typeof resultUrl !== "string" || !resultUrl) {
      console.error("[api/ai/tryon] fal.ai response had no image URL:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: "That generation didn't produce an image — please try again." }, { status: 502 });
    }

    return NextResponse.json({ resultUrl });
  } catch (err) {
    console.error("[api/ai/tryon] unexpected error:", err);
    return NextResponse.json(
      { error: "Couldn't generate that look — please try again with a clearer photo." },
      { status: 500 }
    );
  }
}
