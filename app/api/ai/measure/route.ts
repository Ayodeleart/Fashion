import { NextRequest, NextResponse } from "next/server";

// Vercel's Hobby plan defaults to a hard 10s serverless function timeout,
// but that's raised well past this by enabling Fluid Compute in Project
// Settings -> Functions — Fluid Compute is free on Hobby, not a Pro-only
// feature. Without it enabled, this maxDuration value has no effect and
// Vercel kills the function at 10s regardless of what's set here.
export const maxDuration = 60;


// Groq's current vision-capable model (see console.groq.com/docs/vision).
// Same GROQ_API_KEY as /api/ai/design and /api/ai/compose — one provider,
// one cost profile, no extra key to configure.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const TIMEOUT_MS = 45_000;
const MAX_IMAGE_DATA_URL_LENGTH = 20_000_000;
const MAX_COMPLETION_TOKENS = 450;

const SYSTEM_PROMPT = `You are an expert AI Tailoring and Anthropometric Measurement Engine integrated into a mobile-responsive web application. You will be given ONE image containing two stacked photos of the same person, one directly above the other: the TOP half is a front-view full-body photo, the BOTTOM half is a side-profile full-body photo. Treat them as two separate views of the same person, analyzed together — do not treat the boundary between them as part of either photo. Your task is to return honest, best-effort tailoring measurements in centimeters (cm). A 2D photograph cannot guarantee exact body measurements — never fabricate false precision. Prefer a lower confidence score or a rejected measurement over an invented number.

### CORE VISION LOGIC & CALIBRATION:
Because this is a standard 2D web app capture without hardware depth sensors, establish a Real-World Centimeters-per-Pixel scale using one of two methods:
1. METHOD A (USER HEIGHT PROVIDED — preferred): If a non-zero User_Height_Cm is provided in the input data packet below, locate the person's total vertical pixels from the crown of the head to the floor in the TOP (front-view) photo and use this known height as the calibration reference.
2. METHOD B (NO HEIGHT PROVIDED): If User_Height_Cm is 0 or "Unknown", only fall back to a background reference object (e.g. a door frame) if you can confidently and specifically identify one in the actual photo with a well-known standard size — do not assume one exists. If no reliable reference is visible, do NOT guess a height or fabricate a scale: set "anatomicalPass" to false, or return the measurements with a low confidenceScore (below 0.4) and clearly say in developerNotes that height was not provided and no reliable reference object was found, so the user should retake with their height entered or a labeled reference in frame.

### USE BOTH VIEWS:
Use the TOP (front) photo for shoulder width, chest/bust, waist, hip, and overall proportions. Use the BOTTOM (side) photo to estimate body depth and distinguish depth from width (this materially improves circumference estimates over a front photo alone). Cross-check both together as the same person.

### ANATOMICAL CONSISTENCY CHECK (DO NOT FORCE RATIOS):
Check plausibility, but let the visual evidence win:
- Hip is normally greater than waist, and chest/bust is normally greater than waist. If your read of the photos disagrees with this, do NOT silently force the "normal" ratio — instead, lower the confidenceScore and explain the anatomical inconsistency in developerNotes so a human can review it. Never overwrite a measurement you actually derived from the image just to satisfy a textbook ratio.
- Inseam should track logically with total height and leg proportions; arm length should track with overall body proportions and be checked against inseam and shoulder width; shoulder width should correlate with height. Flag (lower confidence, note in developerNotes) rather than silently "correct" any measurement that looks anatomically implausible given clothing, pose, camera angle, occlusion, or image quality.

### REJECTION CRITERIA:
If clothing, pose, crouching, severe camera tilt, occlusion, poor lighting, or image quality prevents a reasonably reliable read of the body, set "anatomicalPass" to false and clearly explain why in developerNotes (calling out whether the top/front or bottom/side half is the problem, if you can tell) so the app can prompt the user to retake the relevant photo.

### WEIGHT:
Only include an estimated weight in "estimatedWeightKgGuess" if you can reasonably estimate it from build and proportions; otherwise return null for it. Do not guess a number just to fill the field.

### OUTPUT FORMAT:
Return your response strictly as a validated, clean JSON object matching this exact shape. Do not provide conversational text, markdown formatting outside the JSON block, introductions, or post-script explanations.
{
  "calculatedUserMetrics": { "finalHeightCm": 0.0, "estimatedWeightKgGuess": 0.0 },
  "measurements": { "shoulderWidth": 0.0, "chest": 0.0, "waist": 0.0, "hip": 0.0, "armLength": 0.0, "inseam": 0.0 },
  "confidenceScore": 0.00,
  "anatomicalPass": true,
  "developerNotes": "Explain any uncertainty, anatomical inconsistency you flagged instead of forcing, or the reason for rejection."
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
    const { combinedImage, heightCm } = (body ?? {}) as {
      combinedImage?: unknown;
      heightCm?: unknown;
    };

    if (typeof combinedImage !== "string" || !combinedImage) {
      return NextResponse.json({ error: "Both photos are required." }, { status: 400 });
    }
    if (combinedImage.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json({ error: "That photo is too large — try a smaller or lower-resolution image." }, { status: 413 });
    }
    const height = typeof heightCm === "number" && heightCm > 0 ? heightCm : 0;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI measurements aren't configured yet — GROQ_API_KEY is missing." }, { status: 503 });
    }

    const inputPacket =
      `### INPUT DATA PACKET:\n` +
      `User_Height_Cm: ${height > 0 ? height : "0 (Unknown — do not guess a scale unless a reliable reference object is visible)"}\n` +
      `User_Gender_Target_Pattern: Unspecified\n` +
      `Image_View_Provided: BOTH (one image, front-view on top, side-view on bottom)`;

    const imageContent: { type: "image_url"; image_url: { url: string } }[] = [
      { type: "image_url", image_url: { url: combinedImage } },
    ];

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
          max_completion_tokens: MAX_COMPLETION_TOKENS,
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

    return NextResponse.json({
      anatomicalPass: true,
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : null,
      finalHeightCm: parsed.calculatedUserMetrics?.finalHeightCm ?? height,
      weightKg:
        typeof parsed.calculatedUserMetrics?.estimatedWeightKgGuess === "number" &&
        Number.isFinite(parsed.calculatedUserMetrics.estimatedWeightKgGuess) &&
        parsed.calculatedUserMetrics.estimatedWeightKgGuess > 0
          ? Math.round(parsed.calculatedUserMetrics.estimatedWeightKgGuess * 10) / 10
          : null,
      developerNotes: parsed.developerNotes || null,
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
