import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mediaType, url, base64, filename, mimeType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert deepfake detection AI system. You analyze images and videos for signs of AI manipulation, face swapping, lip-sync manipulation, and other deepfake techniques.

When analyzing media, look for these indicators:
- Facial inconsistencies (asymmetry, blurring around face edges, skin texture anomalies)
- Lighting inconsistencies (mismatched shadows, unnatural reflections)
- Temporal artifacts in videos (flickering, frame inconsistencies)
- Background distortion or warping near face boundaries
- Unnatural eye movements, blinking patterns, or gaze direction
- Hair boundary artifacts (blurring, color bleeding)
- Ear/jewelry inconsistencies
- Lip sync issues (mouth movement not matching audio cues)
- Compression artifacts that differ between face and background
- Color space inconsistencies between face and body

You MUST respond with ONLY valid JSON in this exact format:
{
  "verdict": "REAL" | "FAKE" | "SUSPICIOUS",
  "confidence": <number 0-100>,
  "analysis": "<detailed 2-3 sentence analysis>",
  "indicators": ["<indicator1>", "<indicator2>", ...]
}

Be thorough but honest. If you cannot determine authenticity with high confidence, use "SUSPICIOUS". Provide at least 3 specific indicators.`;

    const userContent: any[] = [];

    if (url) {
      userContent.push({
        type: "text",
        text: `Analyze this ${mediaType} from the following URL for deepfake manipulation: ${url}`
      });
      userContent.push({
        type: "image_url",
        image_url: { url }
      });
    } else if (base64) {
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${base64}`;
      userContent.push({
        type: "text",
        text: `Analyze this ${mediaType} (filename: ${filename}) for deepfake manipulation.`
      });
      userContent.push({
        type: "image_url",
        image_url: { url: dataUrl }
      });
    } else {
      throw new Error("No media provided. Please upload a file or provide a URL.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse analysis result");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("detect-deepfake error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
