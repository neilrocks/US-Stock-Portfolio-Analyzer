import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
