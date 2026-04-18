const https = require("https");

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

  const prompt = `You are a senior credit analyst AI for an Indian SME lending platform. Return ONLY valid JSON, no markdown, no extra text, no explanation.

Business: ${businessName || "Unknown"}
Industry: ${industry}
Years: ${years || 0}
Monthly revenue: ${revenue}
Monthly expenses: ${expenses || 0}
Profit margin: ${margin}%
Existing loans: ${loans || "none"}
GST compliance: ${gst || "unknown"}
Customer rating: ${rating || "unknown"}
Loan requested: ${loanAmount || 0}

Return exactly this JSON structure:
{
  "score": <number between 300 and 850>,
  "grade": "<AAA or AA or A or BBB or BB or B or CCC>",
  "verdict": "<Approved or Conditionally Approved or Under Review or Rejected>",
  "cashflow_score": <number 0 to 100>,
  "compliance_score": <number 0 to 100>,
  "reputation_score": <number 0 to 100>,
  "stability_score": <number 0 to 100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2"],
  "max_recommended_loan": <number in rupees>,
  "interest_rate_band": "<e.g. 12-14%>",
  "summary": "<2 to 3 sentences plain English verdict for a lender>"
}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000
    }
  });

  const apiKey = process.env.GEMINI_API_KEY;

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = "";
        response.on("data", chunk => data += chunk);
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid response from AI"));
          }
        });
      });
      request.on("error", reject);
      request.write(body);
      request.end();
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const scored = JSON.parse(clean);
    return res.status(200).json(scored);

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Scoring failed: " + error.message });
  }
};