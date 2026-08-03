/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { Wallet, RefreshCw, Trash2 } from "lucide-react";
import { FinanceData, StockEntry } from "./types";
import SummaryCards from "./components/SummaryCards";
import StockForm from "./components/StockForm";
import SellStockForm from "./components/SellStockForm";
import FileImport from "./components/FileImport";
import ChartsSection from "./components/ChartsSection";
import DataTable from "./components/DataTable";
import AggregatedInsights from "./components/AggregatedInsights";
import EditModal from "./components/EditModal";
import Login from "./components/Login";
import AIInsightsSection from "./components/AIInsightsSection";
import { fetchStockPrice, StockQuote } from "./services/stockService";
import { motion } from "motion/react";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";

export default function App() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState<{ stocks: StockEntry[] }>({ stocks: [] });
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [chartViewMode, setChartViewMode] = useState<"amount" | "percentage">("amount");

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setData({ stocks: [] });
      return;
    }

    const stocksQuery = query(collection(db, "users", user.uid, "stocks"));

    const unsubscribeStocks = onSnapshot(stocksQuery, (snapshot) => {
      const stocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockEntry));
      setData({ stocks });
    });

    return () => {
      unsubscribeStocks();
    };
  }, [user]);

  // Fetch live stock prices
  const refreshPrices = async () => {
    const uniqueSymbols = Array.from(new Set(data.stocks.map((s) => s.name.toUpperCase()))) as string[];
    if (uniqueSymbols.length === 0) return;

    setIsRefreshing(true);
    const newQuotes: Record<string, StockQuote> = { ...quotes };
    
    await Promise.all(
      uniqueSymbols.map(async (symbol: string) => {
        const quote = await fetchStockPrice(symbol);
        if (quote) {
          newQuotes[symbol] = quote;
        }
      })
    );
    
    setQuotes(newQuotes);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (data.stocks.length > 0) {
      refreshPrices();
    }
  }, [data.stocks.length]);

  // Helper to remove undefined properties before saving to Firestore
  const sanitizeForFirestore = (obj: Record<string, any>) => {
    const clean: Record<string, any> = {};
    Object.entries(obj).forEach(([key, val]) => {
      if (val !== undefined) {
        clean[key] = val;
      }
    });
    return clean;
  };

  // Handlers
  const addStock = async (entry: Omit<StockEntry, "id">) => {
    if (!user) return;
    try {
      const cleanData = sanitizeForFirestore(entry);
      await addDoc(collection(db, "users", user.uid, "stocks"), {
        ...cleanData,
        name: entry.name.toUpperCase(),
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding stock transaction:", error);
    }
  };

  const importStocks = async (entries: Omit<StockEntry, "id">[], replace: boolean = false) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      
      if (replace) {
        data.stocks.forEach(s => {
          batch.delete(doc(db, "users", user.uid, "stocks", s.id));
        });
      }

      entries.forEach(entry => {
        const newDocRef = doc(collection(db, "users", user.uid, "stocks"));
        const cleanData = sanitizeForFirestore(entry);
        batch.set(newDocRef, {
          ...cleanData,
          name: entry.name.toUpperCase(),
          uid: user.uid,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error importing stocks:", error);
    }
  };

  const deleteStock = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "stocks", id));
    } catch (error) {
      console.error("Error deleting stock transaction:", error);
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to clear all portfolio data? This action cannot be undone.")) {
      try {
        const batch = writeBatch(db);
        data.stocks.forEach(s => batch.delete(doc(db, "users", user.uid, "stocks", s.id)));
        await batch.commit();
      } catch (error) {
        console.error("Error clearing data:", error);
      }
    }
  };

  const handleEdit = (id: string) => {
    const entry = data.stocks.find(s => s.id === id);
    if (entry) {
      setEditingEntry(entry);
    }
  };

  const saveEdit = async (id: string, updatedData: any) => {
    if (!user) return;
    try {
      const cleanData = sanitizeForFirestore(updatedData);
      await updateDoc(doc(db, "users", user.uid, "stocks", id), {
        ...cleanData,
        name: (updatedData.name || "").toUpperCase()
      });
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating stock transaction:", error);
    }
  };

  // Portfolio & Allocation Calculations
  const { 
    stocksWithReturns, 
    totals, 
    stockAllocation, 
    salesAllocation, 
    summaryChartData, 
    trendData 
  } = useMemo(() => {
    const symbolMap: Record<string, {
      buyAmount: number;
      buyShares: number;
      sellAmount: number;
      sellShares: number;
    }> = {};

    data.stocks.forEach((s) => {
      const sym = s.name.toUpperCase();
      if (!symbolMap[sym]) {
        symbolMap[sym] = { buyAmount: 0, buyShares: 0, sellAmount: 0, sellShares: 0 };
      }
      
      const isSell = s.type === "SELL";
      if (isSell) {
        const price = s.salePrice || s.purchasePrice || 1;
        const shares = s.amount / price;
        symbolMap[sym].sellAmount += s.amount;
        symbolMap[sym].sellShares += shares;
      } else {
        const price = s.purchasePrice || (s.amount / 10);
        const shares = Math.max(0, s.amount / price);
        symbolMap[sym].buyAmount += s.amount;
        symbolMap[sym].buyShares += shares;
      }
    });

    let totalBuyCapital = 0;
    let totalSalesRealized = 0;
    let totalPortfolioMarketValue = 0;

    const activeAllocations: { name: string; value: number }[] = [];
    const salesAllocations: { name: string; value: number }[] = [];

    // Calculate processed stocks for transaction table
    const processedStocks = data.stocks.map((s) => {
      const sym = s.name.toUpperCase();
      const quote = quotes[sym];
      const isSell = s.type === "SELL";

      if (isSell) {
        const price = s.salePrice || s.purchasePrice || 1;
        const currentPrice = quote?.price || price;
        return {
          ...s,
          name: sym,
          currentPrice,
          return: 0,
        };
      } else {
        const price = s.purchasePrice || (s.amount / 10);
        const shares = s.amount / price;
        const currentPrice = quote?.price || price;
        const currentVal = shares * currentPrice;
        const ret = s.amount > 0 ? ((currentVal - s.amount) / s.amount) * 100 : 0;
        return {
          ...s,
          name: sym,
          currentPrice,
          currentValue: currentVal,
          return: ret,
        };
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Net Holdings & Market Value per symbol
    Object.entries(symbolMap).forEach(([sym, info]) => {
      totalBuyCapital += info.buyAmount;
      totalSalesRealized += info.sellAmount;

      if (info.sellAmount > 0) {
        salesAllocations.push({ name: sym, value: info.sellAmount });
      }

      const netShares = info.buyShares - info.sellShares;
      if (netShares > 0.0001) {
        const livePrice = quotes[sym]?.price || (info.buyShares > 0 ? info.buyAmount / info.buyShares : 0);
        const marketVal = netShares * livePrice;
        totalPortfolioMarketValue += marketVal;
        activeAllocations.push({ name: sym, value: marketVal });
      }
    });

    // Chart: Active Portfolio vs Sales Realized
    const summaryData = [
      { name: "Active Portfolio Value", value: totalPortfolioMarketValue },
      { name: "Realized Sales Proceeds", value: totalSalesRealized },
    ];

    // Yearly Trend: Buys vs Sells
    const years: Record<string, { investments: number; sales: number }> = {};
    data.stocks.forEach(s => {
      const date = new Date(s.date);
      const year = isNaN(date.getFullYear()) ? "2026" : date.getFullYear().toString();
      if (!years[year]) years[year] = { investments: 0, sales: 0 };

      if (s.type === "SELL") {
        years[year].sales += s.amount;
      } else {
        years[year].investments += s.amount;
      }
    });

    const processedTrend = Object.entries(years)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return {
      stocksWithReturns: processedStocks,
      totals: {
        totalInvestment: totalBuyCapital,
        totalSales: totalSalesRealized,
        totalPortfolioValue: totalPortfolioMarketValue,
      },
      stockAllocation: activeAllocations,
      salesAllocation: salesAllocations,
      summaryChartData: summaryData,
      trendData: processedTrend,
    };
  }, [data.stocks, quotes]);

  const existingSymbols = useMemo(() => {
    return Array.from(new Set(data.stocks.map(s => s.name.toUpperCase())));
  }, [data.stocks]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SmartPortfolio</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button 
                  onClick={clearAllData}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Clear All Portfolio Data"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={refreshPrices}
                  disabled={isRefreshing}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh Live Stock Prices"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </>
            )}
            <Login />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-50 p-6 rounded-3xl mb-6">
              <Wallet className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to SmartPortfolio</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Track stock purchases and sales, monitor net share holdings, and receive AI-powered portfolio insights in real time. Sign in to get started.
            </p>
            <Login />
          </div>
        ) : (
          <>
            <SummaryCards 
              totalInvestment={totals.totalInvestment} 
              totalSales={totals.totalSales}
              totalPortfolioValue={totals.totalPortfolioValue}
            />

            <AIInsightsSection stocks={data.stocks} />

            {/* Forms Grid: Buy, Sell, and CSV Import */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <StockForm onAdd={addStock} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SellStockForm onAdd={addStock} existingStocks={existingSymbols} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <FileImport onImport={importStocks} />
              </motion.div>
            </div>

            <AggregatedInsights 
              stockAllocation={stockAllocation}
              salesAllocation={salesAllocation}
              totalPortfolioValue={totals.totalPortfolioValue}
              totalSales={totals.totalSales}
            />

            <div id="charts">
              <ChartsSection 
                stockData={stockAllocation}
                summaryData={summaryChartData}
                trendData={trendData}
                viewMode={chartViewMode}
                onToggleViewMode={() => setChartViewMode(prev => prev === "amount" ? "percentage" : "amount")}
              />
            </div>

            <div id="data" className="mb-8">
              <DataTable 
                title="Stock Transaction History (Buys & Sells)"
                data={stocksWithReturns}
                onDelete={deleteStock}
                onEdit={handleEdit}
              />
            </div>
          </>
        )}
      </main>

      <EditModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={saveEdit}
        entry={editingEntry}
      />
    </div>
  );
}
