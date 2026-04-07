import express from "express";
import YahooFinance from "yahoo-finance2";

const app = express();
const yahooFinance = new YahooFinance();

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

export default app;
