import { StockEntry } from "../types";

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

export async function getPortfolioInsights(stocks: StockEntry[]): Promise<PortfolioInsights> {
  try {
    const res = await fetch("/api/portfolio-intelligence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stocks }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Server returned error ${res.status}`);
    }

    const data = await res.json();
    return data as PortfolioInsights;
  } catch (error: any) {
    console.error("Error generating portfolio insights:", error);
    throw new Error(error.message || "Failed to generate AI insights.");
  }
}

