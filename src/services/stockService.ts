export interface StockQuote {
  symbol: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
}

export async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`/api/stock/${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}
