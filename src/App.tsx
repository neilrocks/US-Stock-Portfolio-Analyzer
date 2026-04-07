/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { Wallet, LayoutDashboard, PieChart as PieChartIcon, Table as TableIcon, RefreshCw, Trash2 } from "lucide-react";
import { FinanceData, StockEntry, ExpenseEntry } from "./types";
import SummaryCards from "./components/SummaryCards";
import StockForm from "./components/StockForm";
import ExpenseForm from "./components/ExpenseForm";
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
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";

export default function App() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState<FinanceData>({ stocks: [], expenses: [] });
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ entry: StockEntry | ExpenseEntry; type: "stock" | "expense" } | null>(null);
  const [chartViewMode, setChartViewMode] = useState<"amount" | "percentage">("amount");

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setData({ stocks: [], expenses: [] });
      return;
    }

    const stocksQuery = query(collection(db, "users", user.uid, "stocks"));
    const expensesQuery = query(collection(db, "users", user.uid, "expenses"));

    const unsubscribeStocks = onSnapshot(stocksQuery, (snapshot) => {
      const stocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockEntry));
      setData(prev => ({ ...prev, stocks }));
    });

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseEntry));
      setData(prev => ({ ...prev, expenses }));
    });

    return () => {
      unsubscribeStocks();
      unsubscribeExpenses();
    };
  }, [user]);

  // Fetch stock prices
  const refreshPrices = async () => {
    const uniqueSymbols = Array.from(new Set(data.stocks.map((s) => s.name))) as string[];
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

  // Handlers
  const addStock = async (entry: Omit<StockEntry, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "stocks"), {
        ...entry,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  const importStocks = async (entries: Omit<StockEntry, "id">[], replace: boolean = false) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      
      if (replace) {
        // Delete existing stocks first
        data.stocks.forEach(s => {
          batch.delete(doc(db, "users", user.uid, "stocks", s.id));
        });
      }

      entries.forEach(entry => {
        const newDocRef = doc(collection(db, "users", user.uid, "stocks"));
        batch.set(newDocRef, {
          ...entry,
          uid: user.uid,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error importing stocks:", error);
    }
  };

  const addExpense = async (entry: Omit<ExpenseEntry, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "expenses"), {
        ...entry,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const deleteStock = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "stocks", id));
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      try {
        const batch = writeBatch(db);
        data.stocks.forEach(s => batch.delete(doc(db, "users", user.uid, "stocks", s.id)));
        data.expenses.forEach(e => batch.delete(doc(db, "users", user.uid, "expenses", e.id)));
        await batch.commit();
      } catch (error) {
        console.error("Error clearing data:", error);
      }
    }
  };

  const handleEdit = (id: string, type: "stock" | "expense") => {
    const entry = type === "stock" 
      ? data.stocks.find(s => s.id === id) 
      : data.expenses.find(e => e.id === id);
    if (entry) {
      setEditingEntry({ entry, type });
    }
  };

  const saveEdit = async (id: string, updatedData: any) => {
    if (!user) return;
    try {
      const collectionName = editingEntry?.type === "stock" ? "stocks" : "expenses";
      await updateDoc(doc(db, "users", user.uid, collectionName, id), updatedData);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // Calculations
  const stocksWithReturns = useMemo(() => {
    return data.stocks
      .map(s => {
        const quote = quotes[s.name];
        if (!quote) return s;
        
        const currentPrice = quote.price;
        const purchasePrice = s.purchasePrice || (s.amount / 10);
        const shares = s.amount / purchasePrice;
        const currentVal = shares * currentPrice;
        const ret = ((currentVal - s.amount) / s.amount) * 100;

        return {
          ...s,
          currentPrice,
          return: ret,
          currentValue: currentVal
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.stocks, quotes]);

  const totals = useMemo(() => {
    const totalInvestment = data.stocks.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPortfolioValue = stocksWithReturns.reduce((sum, s: any) => sum + (s.currentValue || s.amount), 0);
    return { totalInvestment, totalExpenses, totalPortfolioValue };
  }, [data, stocksWithReturns]);

  const stockAllocation = useMemo(() => {
    const aggregated: Record<string, number> = {};
    stocksWithReturns.forEach((s: any) => {
      aggregated[s.name] = (aggregated[s.name] || 0) + (s.currentValue || s.amount);
    });
    return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
  }, [stocksWithReturns]);

  const expenseBreakdown = useMemo(() => {
    const aggregated: Record<string, number> = {};
    data.expenses.forEach((e) => {
      aggregated[e.category] = (aggregated[e.category] || 0) + e.amount;
    });
    return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
  }, [data.expenses]);

  const summaryChartData = useMemo(() => [
    { name: "Portfolio Value", value: totals.totalPortfolioValue },
    { name: "Expenses", value: totals.totalExpenses },
  ], [totals]);

  const trendData = useMemo(() => {
    const years: Record<string, { investments: number; expenses: number }> = {};
    
    data.stocks.forEach(s => {
      const date = new Date(s.date);
      const year = date.getFullYear().toString();
      if (!years[year]) years[year] = { investments: 0, expenses: 0 };
      years[year].investments += s.amount;
    });

    data.expenses.forEach(e => {
      const date = new Date(e.date);
      const year = date.getFullYear().toString();
      if (!years[year]) years[year] = { investments: 0, expenses: 0 };
      years[year].expenses += e.amount;
    });

    return Object.entries(years)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => parseInt(a.date) - parseInt(b.date));
  }, [data]);

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
                  title="Clear All Data"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={refreshPrices}
                  disabled={isRefreshing}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh Prices"
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
              Securely track your investments, monitor expenses, and get AI-powered portfolio insights. Sign in to get started.
            </p>
            <Login />
          </div>
        ) : (
          <>
            <SummaryCards 
              totalInvestment={totals.totalInvestment} 
              totalExpenses={totals.totalExpenses} 
              totalPortfolioValue={totals.totalPortfolioValue}
            />

            <AIInsightsSection stocks={data.stocks} expenses={data.expenses} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <StockForm onAdd={addStock} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <FileImport onImport={importStocks} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <ExpenseForm onAdd={addExpense} />
              </motion.div>
            </div>

            <AggregatedInsights 
              stockAllocation={stockAllocation}
              expenseBreakdown={expenseBreakdown}
              totalInvestment={totals.totalInvestment}
              totalExpenses={totals.totalExpenses}
            />

            <div id="charts">
              <ChartsSection 
                stockData={stockAllocation}
                expenseData={expenseBreakdown}
                summaryData={summaryChartData}
                trendData={trendData}
                viewMode={chartViewMode}
                onToggleViewMode={() => setChartViewMode(prev => prev === "amount" ? "percentage" : "amount")}
              />
            </div>

            <div id="data" className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <DataTable 
                title="Recent Stock Investments"
                data={stocksWithReturns}
                type="stock"
                onDelete={deleteStock}
                onEdit={(id) => handleEdit(id, "stock")}
              />
              <DataTable 
                title="Recent Expenses"
                data={[...data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                type="expense"
                onDelete={deleteExpense}
                onEdit={(id) => handleEdit(id, "expense")}
              />
            </div>
          </>
        )}
      </main>

      <EditModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={saveEdit}
        entry={editingEntry?.entry || null}
        type={editingEntry?.type || "stock"}
      />
    </div>
  );
}
