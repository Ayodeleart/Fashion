import { NextRequest, NextResponse } from "next/server";

// Groq's current vision-capable model (see console.groq.com/docs/vision).
// Same GROQ_API_KEY as /api/ai/design and /api/ai/compose — one provider,
// one cost profile, no extra key to configure.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const TIMEOUT_MS = 45_000;
const MAX_IMAGE_DATA_URL_LENGTH = 20_000_000;

const SYSTEM_PROMPT = `You are an expert AI Tailoring and Anthropometric Measurement Engine integrated into a mobile-responsive web application. Your task is to analyze user-submitted full-body photographs captured via a web browser (HTML5 Camera API) and return highly precise, structurally sound tailoring measurements in centimeters (cm).

### CORE VISION LOGIC & CALIBRATION (DYNAMIC REFERENCE SCALING):
Because this is a standard 2D web app capture without hardware depth sensors, you must establish a strict Real-World Centimeters-per-Pixel ratio using one of two methods, prioritizing whichever data point is available:
1. METHOD A (USER HEIGHT PROVIDED): If a non-zero User_Height_Cm is provided in the input data packet below, locate the user's total vertical pixels from the crown of the head to the floor. Use this known height to calculate the exact metric scale.
2. METHOD B (ZERO BACKUP / BACKGROUND REFERENCE): If User_Height_Cm is 0 or "Unknown", automatically locate a permanent architectural reference object in the background (such as a standard interior door frame, door height, or room threshold). Assume a standard interior door frame height is exactly 203 cm (80 inches). Compute its vertical pixel scale to extract the user's height and metrics.

### TAILORING VALIDATION LAYER (CRITICAL ANATOMICAL BOUNDS):
You must act as a master tailor and enforce immutable human body proportions. If raw visual coordinates or pixel counts yield impossible proportions due to camera tilt, lens distortion, or baggy clothing, you MUST auto-correct the outputs using strict anthropometric ratios before outputting JSON:
- HIP VS WAIST: Adult hip circumferences are structurally wider than waist circumferences due to pelvic anatomy. Hip MUST always be greater than Waist (typically Hip ≈ Waist * 1.25 to 1.50). NEVER return a Hip measurement smaller than, or equal to, the Waist.
- CHEST VS WAIST: The Chest/Bust circumference must always be larger than the Waist circumference.
- LENGTH PROPORTIONS: The Inseam length must track logically with the calculated user height (typically accounting for 43% to 47% of total height). Inseam must always be significantly larger than Arm Length.
- SHOULDER WIDTH: Must correlate reasonably with total height (e.g., standard adult ranges from 35cm to 48cm).

### REJECTION CRITERIA:
If the user's body position prevents accurate landmark detection (e.g., heavily baggy clothes completely obscuring the silhouette, deep crouching, severe camera tilt warping perspective, or if no baseline reference can be safely deduced), set "anatomicalPass" to false and explain the error in the developer notes.

### OUTPUT FORMAT:
Return your response strictly as a validated, clean JSON object matching this exact shape. Do not provide conversational text, markdown formatting outside the JSON block, introductions, or post-script explanations.
{
  "calculatedUserMetrics": { "finalHeightCm": 0.0, "estimatedWeightKgGuess": 0.0 },
  "measurements": { "shoulderWidth": 0.0, "chest": 0.0, "waist": 0.0, "hip": 0.0, "armLength": 0.0, "inseam": 0.0 },
  "confidenceScore": 0.00,
  "anatomicalPass": true,
  "developerNotes": "Provide detailed feedback here if any mathematical rules were auto-adjusted or if a specific visual anomaly occurred."
}`;

type MeasureResponse = {
  calculatedUserMetrics?: { finalHeightCm?: number; estimatedWeightKgGuess?: number };
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
      `User_Height_Cm: ${height > 0 ? height : "0 (Unknown — use Method B, background reference)"}\n` +
      `User_Gender_Target_Pattern: Unspecified\n` +
      `Image_View_Provided: ${hasSide ? "BOTH" : "FRONT_VIEW"}`;

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

    return NextResponse.json({
      anatomicalPass: true,
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : null,
      finalHeightCm: parsed.calculatedUserMetrics?.finalHeightCm ?? height,
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
