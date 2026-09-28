// supabase/functions/suggest-caption/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SuggestResult = {
  caption: string;
  type: "info" | "reminder" | "penalty" | "appeal" | "completed";
  priority: "normal" | "high";
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (title.length < 2) {
      return new Response(
        JSON.stringify({ error: "Title is required (min 2 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing GEMINI_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = `You are helping a school discipline office write an announcement.

Title: "${title}"

Write a short, clear, professional announcement body (2-4 sentences, plain text, no markdown, no quotes, no "Dear students" greeting). Also pick the best category and priority.

Respond ONLY with strict JSON, no other text:
{
  "caption": "the announcement body here",
  "type": "info" | "reminder" | "penalty" | "appeal" | "completed",
  "priority": "normal" | "high"
}`;

    // Try up to 2 times on transient 503/429
    let geminiRes: Response | null = null;
    let lastErrText = "";

    for (let attempt = 0; attempt < 2; attempt++) {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/interactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            model: "gemini-3.1-flash-lite",
            input: prompt,
          }),
        },
      );

      if (geminiRes.ok) break;

      lastErrText = await geminiRes.text();
      console.error(`Gemini attempt ${attempt + 1} failed:`, lastErrText);

      if (geminiRes.status !== 503 && geminiRes.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!geminiRes || !geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: "AI service error", detail: lastErrText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiRes.json();

    const steps: any[] = Array.isArray(geminiData?.steps) ? geminiData.steps : [];
    const outputStep = steps.find((s) => s?.type === "model_output");
    const text: string = Array.isArray(outputStep?.content)
      ? outputStep.content
          .filter((c: any) => c?.type === "text" && typeof c.text === "string")
          .map((c: any) => c.text)
          .join("")
      : "";

    let parsed: Partial<SuggestResult> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]) as Partial<SuggestResult>;
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || typeof parsed.caption !== "string" || !parsed.caption.trim()) {
      return new Response(
        JSON.stringify({ error: "AI returned an unexpected response", raw: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const validTypes: SuggestResult["type"][] = [
      "info", "reminder", "penalty", "appeal", "completed",
    ];
    const pickedType = validTypes.includes(parsed.type as SuggestResult["type"])
      ? (parsed.type as SuggestResult["type"])
      : "info";

    const result: SuggestResult = {
      caption: parsed.caption.trim(),
      type: pickedType,
      priority: parsed.priority === "high" ? "high" : "normal",
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});