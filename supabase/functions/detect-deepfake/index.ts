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
      // For URLs, first try to validate the URL points to actual media
      // by checking the content type with a HEAD request
      let isDirectMediaUrl = false;
      try {
        const headResp = await fetch(url, { method: "HEAD", redirect: "follow" });
        const contentType = headResp.headers.get("content-type") || "";
        isDirectMediaUrl = contentType.startsWith("image/") || contentType.startsWith("video/");
      } catch {
        // If HEAD fails, we'll try anyway
      }

      if (isDirectMediaUrl) {
        // Direct media URL — send as image_url for the AI to analyze
        userContent.push({
          type: "text",
          text: `Analyze this ${mediaType} for deepfake manipulation.`
        });
        userContent.push({
          type: "image_url",
          image_url: { url }
        });
      } else {
        // Not a direct media URL (e.g. Google Share link, social media link)
        // Ask the AI to analyze based on the URL description
        userContent.push({
          type: "text",
          text: `The user provided this URL for ${mediaType} deepfake analysis: ${url}

This URL does not point directly to a media file. It may be a sharing link from a platform like Google Drive, social media, etc.

Please provide your analysis. If you cannot access the actual media content from this URL, respond with:
{
  "verdict": "SUSPICIOUS",
  "confidence": 0,
  "analysis": "Unable to analyze: The provided URL is not a direct link to a media file. Please provide a direct image/video URL (ending in .jpg, .png, .mp4, etc.) or upload the file directly.",
  "indicators": ["URL is not a direct media link", "Cannot fetch media content for analysis", "Please use direct file upload or a direct media URL"]
}`
        });
      }
    } else if (base64) {
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${base64}`;
      
      if (mediaType === "video") {
        // For video files sent as base64, we can't send the full video to vision API
        // Extract context and analyze what we can
        userContent.push({
          type: "text",
          text: `Analyze this ${mediaType} (filename: ${filename}, type: ${mimeType}) for deepfake manipulation. This is a video file uploaded for analysis.`
        });
        // Send the first frame / thumbnail if it's a supported image type, 
        // otherwise just do text-based analysis
        if (mimeType?.startsWith("image/")) {
          userContent.push({
            type: "image_url",
            image_url: { url: dataUrl }
          });
        } else {
          // For actual video files, inform that we're doing limited analysis
          userContent.push({
            type: "text",
            text: `Note: Direct video binary analysis is limited. Based on the file metadata and any available visual cues, provide your best assessment. If the analysis is uncertain due to format limitations, indicate this in your response with a SUSPICIOUS verdict and lower confidence.`
          });
        }
      } else {
        userContent.push({
          type: "text",
          text: `Analyze this ${mediaType} (filename: ${filename}) for deepfake manipulation.`
        });
        userContent.push({
          type: "image_url",
          image_url: { url: dataUrl }
        });
      }
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
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a few seconds." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Parse error for more specific message
      let errorMessage = "AI analysis failed. Please try again.";
      try {
        const errorData = JSON.parse(text);
        if (errorData?.error?.message?.includes("URL did not return an image")) {
          errorMessage = "The provided URL does not point to a valid image or video file. Please use a direct media URL (e.g., ending in .jpg, .png, .mp4) or upload the file directly.";
        }
      } catch { /* ignore parse errors */ }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
