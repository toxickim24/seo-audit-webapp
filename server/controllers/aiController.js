import { getOpenAI } from "../config/openai.js";

export async function runSeoAudit(req, res) {
  const raw = req.body;
  if (!raw || !raw.domain) {
    return res
      .status(400)
      .json({ error: "Missing SEO audit input (expected at least a domain)" });
  }

  try {
    // ✅ Initialize client at runtime (after env is loaded)
    const client = getOpenAI();

    // === Collect perf hints safely, including savingsMs ===
    const perfHints = [];
    const processOpportunities = (ops) => {
      if (Array.isArray(ops)) {
        ops.forEach((p) => {
          if (p.savingsMs && typeof p.savingsMs === "number") {
            const sec = (p.savingsMs / 1000).toFixed(1);
            perfHints.push(`${p.title} (~${sec}s savings)`);
          } else {
            perfHints.push(p.title || p.description);
          }
        });
      }
    };

    processOpportunities(raw.performance?.desktop?.opportunities);
    processOpportunities(raw.performance?.mobile?.opportunities);

    const systemPrompt = `You are an expert Technical SEO lead. 
    Return actionable, conservative recommendations for improving a website's SEO.

    Rules:
    - DO NOT repeat numeric scores or percentages in 'bullets' (Key Findings).
    - The 'scores' object must ONLY contain numeric values for each category.
    - 'bullets' = descriptive, human-readable insights (e.g., missing headings, image alt tags, etc.)
    - Write in friendly, non-technical English.
    - Prefer low-effort/high-impact items for 'quick_wins'.
    - Group fixes into a clear 4-week roadmap.
    - NEVER fabricate numbers or metrics.
    - Only include 'total_potential_speed_gain_sec' if numeric hints exist.`;

    const userMessages = [
      { role: "user", content: `RAW_AUDIT_RESULTS_JSON:\n${JSON.stringify(raw)}` },
      { role: "user", content: `PERFORMANCE_HINT_LINES:\n${perfHints.join("\n")}` },
      { role: "user", content: "Return the structured JSON for the analysis only." },
    ];

    // === Schema definition ===
    const analysisSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        headline: { type: "string" },
        overall_summary: { type: "string" },
        bullets: { type: "array", items: { type: "string" }, minItems: 3 },
        quick_wins: { type: "array", items: { type: "string" }, minItems: 3 },
        scores: {
          type: "object",
          additionalProperties: false,
          properties: {
            overall: { type: "number" },
            onpage: { type: "number" },
            technical: { type: "number" },
            content: { type: "number" },
            performance: { type: "number" },
          },
          required: ["overall", "onpage", "technical", "content", "performance"],
        },
        category_notes: {
          type: "object",
          additionalProperties: false,
          properties: {
            onpage: { type: "string" },
            technical: { type: "string" },
            content: { type: "string" },
            performance: { type: "string" },
          },
          required: ["onpage", "technical", "content", "performance"],
        },
        prioritized_issues: {
          type: "array",
          minItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              issue: { type: "string" },
              priority: { type: "string", enum: ["High", "Medium", "Low"] },
              fix_steps: { type: "array", items: { type: "string" }, minItems: 2 },
            },
            required: ["issue", "priority", "fix_steps"],
          },
        },
        roadmap_weeks: {
          type: "object",
          additionalProperties: false,
          properties: {
            week_1: { type: "array", items: { type: "string" } },
            week_2: { type: "array", items: { type: "string" } },
            week_3: { type: "array", items: { type: "string" } },
            week_4: { type: "array", items: { type: "string" } },
          },
          required: ["week_1", "week_2", "week_3", "week_4"],
        },
        total_potential_speed_gain_sec: { type: ["number", "null"] },
        disclaimers: { type: "array", items: { type: "string" } },
      },
      required: [
        "headline",
        "overall_summary",
        "bullets",
        "quick_wins",
        "scores",
        "category_notes",
        "prioritized_issues",
        "roadmap_weeks",
        "total_potential_speed_gain_sec",
        "disclaimers",
      ],
    };

    // === AI Call ===
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [{ role: "system", content: systemPrompt }, ...userMessages],
      text: {
        format: {
          type: "json_schema",
          name: "SeoAuditSchema",
          schema: analysisSchema,
        },
      },
    });

    // === Safe JSON parsing ===
    let cleaned = response.output_text || "{}";
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace !== -1) cleaned = cleaned.substring(0, lastBrace + 1);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("❌ JSON parse failed. Cleaned output:", cleaned);
      return res.status(500).json({
        error: "Failed to parse AI output (after cleaning)",
        raw: cleaned,
      });
    }

    return res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error("OpenAI route error:", err);
    return res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
}
