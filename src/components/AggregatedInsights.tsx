import { formatCurrency } from "@/src/lib/utils";
import { motion } from "motion/react";

interface AggregatedInsightsProps {
  stockAllocation: { name: string; value: number }[];
  salesAllocation?: { name: string; value: number }[];
  totalPortfolioValue: number;
  totalSales?: number;
}

export default function AggregatedInsights({
  stockAllocation,
  salesAllocation = [],
  totalPortfolioValue,
  totalSales = 0,
}: AggregatedInsightsProps) {
  const sortedActive = [...stockAllocation].sort((a, b) => b.value - a.value);
  const sortedSales = [...salesAllocation].sort((a, b) => b.value - a.value);
  const totalHeldValue = sortedActive.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Active Holdings Aggregation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Active Stock Allocation</h3>
            <p className="text-xs text-slate-400">Share of current active holdings value (sorted highest to lowest)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full shrink-0">
            {sortedActive.length} Active {sortedActive.length === 1 ? 'Stock' : 'Stocks'}
          </span>
        </div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedActive.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No active stock holdings yet. Add stock purchases to view allocation.</p>
          ) : (
            sortedActive.map((stock) => {
              const percentage = totalHeldValue > 0 ? (stock.value / totalHeldValue) * 100 : 0;
              return (
                <div key={stock.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">{stock.name}</span>
                    <span className="text-slate-600 font-medium">
                      {formatCurrency(stock.value)} <span className="text-blue-600 font-bold">({percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Realized Sales Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Realized Stock Sales Breakdown</h3>
            <p className="text-xs text-slate-400">Total cash proceeds per sold stock (sorted highest to lowest)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full shrink-0">
            {sortedSales.length} Sold {sortedSales.length === 1 ? 'Symbol' : 'Symbols'}
          </span>
        </div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedSales.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No stock sales recorded yet. Use 'Track Stock Sale' to record sales.</p>
          ) : (
            sortedSales.map((sale) => {
              const percentage = totalSales > 0 ? (sale.value / totalSales) * 100 : 0;
              return (
                <div key={sale.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">{sale.name}</span>
                    <span className="text-slate-600 font-medium">
                      {formatCurrency(sale.value)} <span className="text-indigo-600 font-semibold">({percentage.toFixed(1)}% of sales)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      className="bg-indigo-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
