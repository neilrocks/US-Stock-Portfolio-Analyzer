import { useState } from "react";
import { Sparkles, AlertTriangle, TrendingUp, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StockEntry, ExpenseEntry } from "../types";
import { getPortfolioInsights, PortfolioInsights } from "../services/geminiService";
import { formatCurrency } from "../lib/utils";

interface AIInsightsSectionProps {
  stocks: StockEntry[];
  expenses: ExpenseEntry[];
}

export default function AIInsightsSection({ stocks, expenses }: AIInsightsSectionProps) {
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const generateInsights = async () => {
    if (stocks.length === 0) {
      setError("Add some stocks to your portfolio first!");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPortfolioInsights(stocks, expenses);
      setInsights(data);
    } catch (err) {
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!insights && !isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl shadow-xl border border-indigo-500/20 mb-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold">Portfolio Intelligence</h2>
          </div>
          <p className="text-indigo-100 mb-6 max-w-2xl">
            Get deep insights into your portfolio diversification, risk levels, and personalized stock recommendations powered by Gemini AI.
          </p>
          <button
            onClick={generateInsights}
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Analysis
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          AI Portfolio Intelligence
        </h2>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Analysis
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : insights && (
        <>
          {/* Main Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="bg-blue-50 p-3 rounded-xl w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Diversification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{insights.diversificationAnalysis}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="bg-amber-50 p-3 rounded-xl w-fit mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Risk Assessment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{insights.riskAssessment}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="bg-emerald-50 p-3 rounded-xl w-fit mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Rebalancing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{insights.rebalancingSuggestions}</p>
            </motion.div>
          </div>

          {/* Stock Recommendations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Stock-Level Insights
            </h3>
            <div className="space-y-4">
              {Object.entries(insights.stockRecommendations).map(([symbol, data]) => {
                const rec = data as { insights: string; suggestion: string };
                return (
                  <div key={symbol} className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedStock(expandedStock === symbol ? null : symbol)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700">
                          {symbol}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              rec.suggestion === "Buy More" ? "bg-emerald-100 text-emerald-700" :
                              rec.suggestion === "Hold" ? "bg-blue-100 text-blue-700" :
                              rec.suggestion === "Reduce" ? "bg-amber-100 text-amber-700" :
                              "bg-rose-100 text-rose-700"
                            }`}>
                              {rec.suggestion}
                            </span>
                          </div>
                        </div>
                      </div>
                      {expandedStock === symbol ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedStock === symbol && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 border-t border-slate-50"
                        >
                          <div className="pt-4 text-sm text-slate-600 leading-relaxed">
                            {rec.insights}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Strategy Improvements
              </h3>
              <div className="space-y-4 text-sm text-slate-300">
                <p>{insights.improvementSuggestions}</p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">Sector Allocation</h4>
                  <p className="text-slate-400">{insights.sectorAllocationSuggestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                New Stocks to Consider
              </h3>
              <div className="flex flex-wrap gap-3">
                {insights.newStocksToConsider.map((symbol) => (
                  <div key={symbol} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-2">
                    <span className="font-bold text-indigo-700">{symbol}</span>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-indigo-400 italic">
                Note: These recommendations are generated by AI for informational purposes only and do not constitute financial advice.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
