import { formatCurrency } from "@/src/lib/utils";
import { motion } from "motion/react";

interface AggregatedInsightsProps {
  stockAllocation: { name: string; value: number }[];
  expenseBreakdown: { name: string; value: number }[];
  totalInvestment: number;
  totalExpenses: number;
}

export default function AggregatedInsights({
  stockAllocation,
  expenseBreakdown,
  totalInvestment,
  totalExpenses,
}: AggregatedInsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Stock Aggregation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Stock Aggregation</h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {stockAllocation.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No stock data available.</p>
          ) : (
            stockAllocation.map((stock) => {
              const percentage = totalInvestment > 0 ? (stock.value / totalInvestment) * 100 : 0;
              return (
                <div key={stock.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{stock.name}</span>
                    <span className="text-slate-500">
                      {formatCurrency(stock.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="bg-blue-500 h-1.5 rounded-full"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Expense Aggregation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Expense Aggregation</h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {expenseBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No expense data available.</p>
          ) : (
            expenseBreakdown.map((expense) => {
              const percentage = totalExpenses > 0 ? (expense.value / totalExpenses) * 100 : 0;
              return (
                <div key={expense.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{expense.name}</span>
                    <span className="text-slate-500">
                      {formatCurrency(expense.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="bg-rose-500 h-1.5 rounded-full"
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
