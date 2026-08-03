import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import YahooFinance from "yahoo-finance2";
import OpenAI from "openai";

const yahooFinance = new YahooFinance();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Stock Prices
  app.get("/api/stock/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }
      
      const result = await yahooFinance.quote(symbol) as any;
      
      if (!result) {
        return res.status(404).json({ error: "Stock not found" });
      }

      res.json({
        symbol: result.symbol,
        price: result.regularMarketPrice,
        currency: result.currency,
        change: result.regularMarketChange,
        changePercent: result.regularMarketChangePercent,
      });
    } catch (error: any) {
      console.error(`Error fetching stock ${req.params.symbol}:`, error);
      res.status(500).json({ 
        error: "Failed to fetch stock data", 
        message: error.message,
        symbol: req.params.symbol 
      });
    }
  });

  // API Route for Portfolio Intelligence using Nvidia Llama 3.2 Endpoint
  app.post("/api/portfolio-intelligence", async (req, res) => {
    try {
      const { stocks } = req.body;
      if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
        return res.status(400).json({ error: "A non-empty list of stocks is required" });
      }

      const portfolioSummary = stocks.map((s: any) => ({
        symbol: s.name,
        type: s.type || "BUY",
        amount: s.amount,
        purchasePrice: s.purchasePrice,
        salePrice: s.salePrice,
        date: s.date
      }));

      const systemPrompt = `You are an expert AI financial portfolio advisor. You analyze stock portfolios (including buy and sell transactions) and return structured JSON recommendations.
CRITICAL REQUIREMENT: You MUST respond with ONLY a valid JSON object matching this exact schema:
{
  "diversificationAnalysis": "Detailed concise summary of portfolio diversification across assets",
  "riskAssessment": "Risk level analysis based on stock selection and transaction size",
  "rebalancingSuggestions": "Specific actionable suggestions for rebalancing",
  "stockRecommendations": {
    "SYMBOL": {
      "insights": "Short analysis for this ticker",
      "suggestion": "Hold"
    }
  },
  "improvementSuggestions": "Strategic improvements for overall performance",
  "sectorAllocationSuggestions": "Suggestions regarding sector weighting",
  "newStocksToConsider": ["TICKER1", "TICKER2", "TICKER3"]
}
In "stockRecommendations", for each unique ticker symbol present in the portfolio, map "suggestion" to ONE OF EXACTLY THESE STRINGS: "Hold", "Buy More", "Reduce", or "Exit". Do not include any intro, outro, or markdown formatting outside of raw JSON.`;

      const userContent = `Here is the current portfolio transaction history:
${JSON.stringify(portfolioSummary, null, 2)}

Analyze this portfolio and generate structured insights.`;

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.2-3b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        stream: false
      });

      let responseText = completion.choices[0]?.message?.content || "";
      
      // Clean up markdown code blocks if the LLM returned ```json ... ```
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      }

      // Fallback parsing logic
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }

      const parsedJSON = JSON.parse(responseText);
      res.json(parsedJSON);
    } catch (error: any) {
      console.error("Error generating portfolio intelligence:", error);
      res.status(500).json({ 
        error: "Failed to generate portfolio insights", 
        message: error?.message || "Internal server error" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
