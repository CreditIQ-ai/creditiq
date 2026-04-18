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

  const prompt = `You are a senior credit analyst AI for an Indian SME lending platform. Return ONLY valid JSON, no markdown, no extra text.

Business: ${businessName || "Unknown"}
Industry: ${industry}
Years: ${years || 0}
Monthly revenue: ${revenue}
Monthly expenses: ${expenses || 0}
Profit margin: ${margin}%
Existing loans: ${loans || "none"}
GST: ${gst || "unknown"}
Rating: ${rating || "unknown"}
Loan requested: ${loanAmount || 0}

{"score":300-850,"grade":"AAA|AA|A|BBB|BB|B|CCC","verdict":"Approved|Conditionally Approved|Under Review|Rejected","cashflow_score":0-100,"compliance_score":0-100,"reputation_score":0-100,"stability_score":0-100,"strengths":["s1","s2","s3"],"risks":["r1","r2"],"max_recommended_loan":0,"interest_rate_band":"x-y%","summary":"2-3 sentences"}`;

  const body = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  });

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
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

    if (!result.content || !result.content[0]) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    const text = result.content.map(i => i.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const scored = JSON.parse(clean);
    return res.status(200).json(scored);

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Scoring failed: " + error.message });
  }
};