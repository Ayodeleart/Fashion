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
    const { personImage, productImageUrl, productName } = await request.json();

    if (typeof personImage !== "string" || !personImage) {
      return NextResponse.json({ error: "A photo of you is required." }, { status: 400 });
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

    const falRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
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
    });

    if (!falRes.ok) {
      const errText = await falRes.text();
      throw new Error(`fal.ai error (${falRes.status}): ${errText.slice(0, 300)}`);
    }

    const data = await falRes.json();
    const resultUrl: string | undefined = data?.images?.[0]?.url;
    if (!resultUrl) throw new Error("fal.ai returned no image.");

    return NextResponse.json({ resultUrl });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Couldn't generate that look — please try again with a clearer photo.",
      },
      { status: 500 }
    );
  }
}
