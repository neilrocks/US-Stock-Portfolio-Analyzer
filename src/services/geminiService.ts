import { GoogleGenAI } from "@google/genai";
import { StockEntry, ExpenseEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PortfolioInsights {
  diversificationAnalysis: string;
  riskAssessment: string;
  rebalancingSuggestions: string;
  stockRecommendations: {
    [symbol: string]: {
      insights: string;
      suggestion: "Hold" | "Buy More" | "Reduce" | "Exit";
    };
  };
  improvementSuggestions: string;
  sectorAllocationSuggestions: string;
  newStocksToConsider: string[];
}

export async function getPortfolioInsights(stocks: StockEntry[], expenses: ExpenseEntry[]): Promise<PortfolioInsights> {
  const portfolioData = stocks.map(s => ({
    symbol: s.name,
    amount: s.amount,
    purchasePrice: s.purchasePrice,
    date: s.date
  }));

  const prompt = `
    Analyze the following stock portfolio and provide detailed financial insights.
    
    Portfolio Data:
    ${JSON.stringify(portfolioData, null, 2)}
    
    Please provide the analysis in the following JSON format:
    {
      "diversificationAnalysis": "...",
      "riskAssessment": "...",
      "rebalancingSuggestions": "...",
      "stockRecommendations": {
        "SYMBOL": {
          "insights": "Fundamental and Technical analysis summary",
          "suggestion": "Hold | Buy More | Reduce | Exit"
        }
      },
      "improvementSuggestions": "...",
      "sectorAllocationSuggestions": "...",
      "newStocksToConsider": ["SYMBOL1", "SYMBOL2", ...]
    }
    
    Ensure the response is a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as PortfolioInsights;
  } catch (error) {
    console.error("Error generating portfolio insights:", error);
    throw error;
  }
}
