import { NextRequest, NextResponse } from "next/server";

// Groq's current vision-capable model (see console.groq.com/docs/vision).
// Same GROQ_API_KEY as /api/ai/design and /api/ai/compose — one provider,
// one cost profile, no extra key to configure.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const TIMEOUT_MS = 45_000;
const MAX_IMAGE_DATA_URL_LENGTH = 20_000_000;

const SYSTEM_PROMPT = `You are an expert AI Tailoring and Anthropometric Measurement Engine integrated into a mobile-responsive web application. Your task is to analyze user-submitted full-body photographs (front view, and a side view when provided) captured via a web browser camera, and return honest, well-reasoned tailoring measurements in centimeters (cm). Accuracy and honesty about uncertainty matter more than confident-sounding numbers.

### CALIBRATION (SCALE REFERENCE):
1. PRIMARY: If a non-zero User_Height_Cm is provided in the input data packet, use the user's total vertical pixels (crown of head to floor) in the front view to establish the real-world centimeters-per-pixel scale. This is the preferred method whenever height is available — prioritize it over any visual guess.
2. FALLBACK: If User_Height_Cm is 0 or "Unknown", only use a background object as a scale reference if you can confidently identify one with a well-known, reliable real-world size (e.g. a standard door clearly full-height in frame). Do not invent or assume a reference object is present if you are not confident one is actually visible and identifiable in the image. If no reliable reference exists and no height was given, do not fabricate a scale — return your best-effort relative proportions, mark confidenceScore low (0.3 or below), and say clearly in developerNotes that no reliable calibration reference was available and the user should provide their height for an accurate result.

### USING THE SIDE VIEW:
When a side view is provided, use it to refine depth-related estimates (chest/bust and waist depth vs width, posture) rather than relying on the front view's silhouette alone for circumference estimates. Two views together should generally increase your confidence score versus a front-only estimate — reflect that in confidenceScore.

### ANATOMICAL PLAUSIBILITY CHECK (not a forced rule):
Sanity-check your outputs against normal human proportions, but do not force an arbitrary ratio onto what you actually observe in the photos:
- Hip is typically greater than waist for adult bodies, but if the visual evidence in the photos clearly shows otherwise for this specific person, report what you observe rather than distorting it to fit the typical pattern — note the discrepancy in developerNotes instead of silently "correcting" it.
- Chest/bust is typically larger than waist; same principle — observe first, don't force.
- Inseam should track logically with height (roughly 43-47% of total height) and should normally exceed arm length; flag it in developerNotes rather than inventing a number if the photos genuinely suggest otherwise.
- Shoulder width should correlate reasonably with height (roughly 35-48cm for most adults).
If a specific measurement looks implausible AND you're not confident in what you observed (as opposed to a genuine outlier body), lower confidenceScore and explain in developerNotes rather than quietly substituting a "safer" number.

### REJECTION CRITERIA:
Set "anatomicalPass" to false only when you genuinely cannot produce a usable estimate — e.g. the body isn't clearly visible, heavily baggy clothing completely obscures the silhouette, a deep crouch or extreme camera tilt warps the perspective beyond use, or the photo is unusable (too dark, cropped, blurry). When you reject, explain exactly what was wrong and what the user should fix in developerNotes (e.g. "your legs weren't visible in the front photo" or "the side photo was too dark to read your silhouette") so they know what to retake. Prefer a low-confidence pass with an honest explanation over an outright rejection when you do have a usable, if imperfect, estimate.

### OUTPUT FORMAT:
Return your response strictly as a validated, clean JSON object matching this exact shape. Do not provide conversational text, markdown formatting outside the JSON block, introductions, or post-script explanations. estimatedWeightKgGuess must be null if you cannot reasonably estimate it — do not guess just to fill the field.
{
  "calculatedUserMetrics": { "finalHeightCm": 0.0, "estimatedWeightKgGuess": 0.0 },
  "measurements": { "shoulderWidth": 0.0, "chest": 0.0, "waist": 0.0, "hip": 0.0, "armLength": 0.0, "inseam": 0.0 },
  "confidenceScore": 0.00,
  "anatomicalPass": true,
  "developerNotes": "Explain your calibration method, any proportions that looked unusual and why you kept or flagged them, and anything that lowered your confidence."
}`;

type MeasureResponse = {
  calculatedUserMetrics?: { finalHeightCm?: number; estimatedWeightKgGuess?: number | null };
  measurements?: {
    shoulderWidth?: number;
    chest?: number;
    waist?: number;
    hip?: number;
    armLength?: number;
    inseam?: number;
  };
  confidenceScore?: number;
  anatomicalPass?: boolean;
  developerNotes?: string;
};

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }
    const { frontImage, sideImage, heightCm } = (body ?? {}) as {
      frontImage?: unknown;
      sideImage?: unknown;
      heightCm?: unknown;
    };

    if (typeof frontImage !== "string" || !frontImage) {
      return NextResponse.json({ error: "A front photo is required." }, { status: 400 });
    }
    if (frontImage.length > MAX_IMAGE_DATA_URL_LENGTH || (typeof sideImage === "string" && sideImage.length > MAX_IMAGE_DATA_URL_LENGTH)) {
      return NextResponse.json({ error: "That photo is too large — try a smaller or lower-resolution image." }, { status: 413 });
    }
    const height = typeof heightCm === "number" && heightCm > 0 ? heightCm : 0;
    const hasSide = typeof sideImage === "string" && sideImage.length > 0;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI measurements aren't configured yet — GROQ_API_KEY is missing." }, { status: 503 });
    }

    const inputPacket =
      `### INPUT DATA PACKET:\n` +
      `User_Height_Cm: ${height > 0 ? height : "0 (Unknown — only use a background reference if you can confidently identify one; otherwise use a low confidence score)"}\n` +
      `User_Gender_Target_Pattern: Unspecified\n` +
      `Image_View_Provided: ${hasSide ? "BOTH (front and side)" : "FRONT_VIEW only — no side view was provided, so depth-dependent measurements (chest/waist) are inherently less certain; reflect that in confidenceScore"}`;

    const imageContent: { type: "image_url"; image_url: { url: string } }[] = [{ type: "image_url", image_url: { url: frontImage } }];
    if (hasSide) imageContent.push({ type: "image_url", image_url: { url: sideImage as string } });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let groqRes: Response;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [{ type: "text", text: inputPacket }, ...imageContent],
            },
          ],
          temperature: 0.2,
          max_completion_tokens: 700,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        return NextResponse.json({ error: "That's taking longer than expected — please try again." }, { status: 504 });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

    if (!groqRes.ok) {
      let detail = "";
      try {
        detail = await groqRes.text();
      } catch {
        // ignore
      }
      console.error(`[api/ai/measure] Groq returned ${groqRes.status}: ${detail.slice(0, 500)}`);
      const message =
        groqRes.status === 401 || groqRes.status === 403
          ? "AI measurements aren't configured correctly — check the GROQ_API_KEY value."
          : "Couldn't read those photos right now — please try again.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    let data: unknown;
    try {
      data = await groqRes.json();
    } catch {
      return NextResponse.json({ error: "Received an unexpected response — please try again." }, { status: 502 });
    }

    const content = (data as { choices?: { message?: { content?: string } }[] } | null)?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "That analysis didn't come back with anything usable — please try again." }, { status: 502 });
    }

    let parsed: MeasureResponse;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[api/ai/measure] Model returned non-JSON:", content.slice(0, 500));
      return NextResponse.json({ error: "Couldn't make sense of that analysis — please try again." }, { status: 502 });
    }

    const m = parsed.measurements;
    const hasAllFields =
      m &&
      [m.shoulderWidth, m.chest, m.waist, m.hip, m.armLength, m.inseam].every(
        (v) => typeof v === "number" && Number.isFinite(v) && v > 0
      );

    if (parsed.anatomicalPass === false || !hasAllFields) {
      return NextResponse.json({
        anatomicalPass: false,
        developerNotes:
          parsed.developerNotes ||
          "Couldn't get reliable measurements from those photos — try again with better lighting, a plainer background, and your full body in frame.",
      });
    }

    const weightGuess = parsed.calculatedUserMetrics?.estimatedWeightKgGuess;

    return NextResponse.json({
      anatomicalPass: true,
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : null,
      finalHeightCm: parsed.calculatedUserMetrics?.finalHeightCm ?? height,
      estimatedWeightKg: typeof weightGuess === "number" && Number.isFinite(weightGuess) ? weightGuess : null,
      developerNotes: parsed.developerNotes ?? null,
      measurements: {
        shoulderCm: Math.round((m!.shoulderWidth as number) * 10) / 10,
        chestCm: Math.round((m!.chest as number) * 10) / 10,
        waistCm: Math.round((m!.waist as number) * 10) / 10,
        hipCm: Math.round((m!.hip as number) * 10) / 10,
        armLengthCm: Math.round((m!.armLength as number) * 10) / 10,
        inseamCm: Math.round((m!.inseam as number) * 10) / 10,
      },
    });
  } catch (err) {
    console.error("[api/ai/measure] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong analyzing those photos — please try again." }, { status: 500 });
  }
}
