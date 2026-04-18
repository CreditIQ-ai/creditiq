module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    businessName, industry, years, revenue,
    expenses, loans, gst, rating, loanAmount
  } = req.body;

  if (!revenue || !industry) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const margin = revenue > 0
    ? Math.round(((revenue - expenses) / revenue) * 100)
    : 0;

  const prompt = `You are a senior credit analyst AI for an Indian SME lending platform. Analyse this business and return ONLY a valid JSON object with no markdown, no extra text.

Business: ${businessName || "Unknown"}
Industry: ${industry}
Years operating: ${years || 0}
Monthly revenue: ${revenue}
Monthly expenses: ${expenses || 0}
Profit margin: ${margin}%
Existing loans: ${loans || "none"}
GST compliance: ${gst || "unknown"}
Customer rating: ${rating || "unknown"}
Loan requested: ${loanAmount || 0}

Return exactly this JSON:
{
  "score": <300-850>,
  "grade": "<AAA|AA|A|BBB|BB|B|CCC>",
  "verdict": "<Approved|Conditionally Approved|Under Review|Rejected>",
  "cashflow_score": <0-100>,
  "compliance_score": <0-100>,
  "reputation_score": <0-100>,
  "stability_score": <0-100>,
  "strengths": ["s1","s2","s3"],
  "risks": ["r1","r2"],
  "max_recommended_loan": <number>,
  "interest_rate_band": "<e.g. 12-14%>",
  "summary": "<2-3 sentences for a lender>"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(i => i.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Scoring failed. Please try again." });
  }
};